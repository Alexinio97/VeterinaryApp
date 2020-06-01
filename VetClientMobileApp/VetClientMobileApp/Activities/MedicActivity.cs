﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Android.App;
using Android.Content;
using Android.Gms.Tasks;
using Android.OS;
using Android.Runtime;
using Android.Views;
using Android.Widget;
using Firebase;
using Firebase.Auth;
using Firebase.Firestore;
using Java.Util;
using VetClientMobileApp.Adapter;
using VetClientMobileApp.Models;
using VetClientMobileApp.Services;

namespace VetClientMobileApp.Activities
{
    [Activity(Label = "MedicActivity")]
    public class MedicActivity : Activity, IOnSuccessListener,IOnFailureListener
    {
        private readonly IUserService _userService;
        private List<Medic> _medicsFetched;
        private FirebaseFirestore _firestoreDb;
        private ListView medicListView;
        private readonly StorageService _storageService;
        private readonly FirebaseFunctionsService _functionsService;
        public MedicActivity()
        {
            _userService = new UserService();
            _medicsFetched = new List<Medic>();
            _storageService = new StorageService();
            _functionsService = new FirebaseFunctionsService(this, this);
        }
        protected override void OnCreate(Bundle savedInstanceState)
        {
            base.OnCreate(savedInstanceState);
            SetContentView(Resource.Layout.medics);
            _firestoreDb = _userService.GetDatabase(this);


            medicListView = FindViewById<ListView>(Resource.Id.lstView_medics);
            FetchData();
        }

        public void FetchData()
        {
            try
            {
                // add on success listener
                _firestoreDb.Collection("Medics").Get().AddOnSuccessListener(this).AddOnFailureListener(this);
            }
            catch(System.Exception ex)
            {
                Console.WriteLine("Error fetching medics:", ex.Message);
                Toast.MakeText(this, "Error fetching medics!", ToastLength.Long);
            }
        }

        public void OnSuccess(Java.Lang.Object result)
        {
           var snapshot = (QuerySnapshot)result;

            if (!snapshot.IsEmpty)
            {
                var documents = snapshot.Documents;

                _medicsFetched.Clear();
                foreach (var document in documents)
                {
                    Medic newMedic = new Medic();

                    // populate medics data
                    newMedic.Id = document.Id;
                    newMedic.Email = document.Get("Email").ToString();
                    newMedic.FirstName = document.Get("FirstName").ToString();
                    newMedic.LastName = document.Get("LastName").ToString();
                    newMedic.Phone = document.Get("Phone").ToString();
                    newMedic.Photo = document.GetString("Photo");
                    var scheduleReceived = document.Get("Schedule");
                    
                    if(scheduleReceived != null)
                    {
                        var dictHasMap = new JavaDictionary<string, string>(scheduleReceived.Handle, Android.Runtime.JniHandleOwnership.DoNotRegister);
                        newMedic.Schedule = new Dictionary<string, string>();
                        foreach (KeyValuePair<string, string> item in dictHasMap)
                        {
                            newMedic.Schedule.Add(item.Key, item.Value);
                        }
                    }

                    _medicsFetched.Add(newMedic);
                }
                medicListView.Adapter = new MedicAdapter(this, _medicsFetched.ToArray());
                medicListView.ItemClick += MedicListView_ItemClick;
            }
        }

        private async void MedicListView_ItemClick(object sender, AdapterView.ItemClickEventArgs e)
        {
            var medicSelected = _medicsFetched[e.Position];
            var clientLoggedData = await _storageService.GetClientDataLocal();
            // create hashMap in order to insert the client into the selected medic database
            HashMap mapClient = new HashMap();
            mapClient.Put("Email", clientLoggedData.Email);
            mapClient.Put("FirstName", clientLoggedData.FirstName);
            mapClient.Put("LastName", clientLoggedData.LastName);
            mapClient.Put("Phone", clientLoggedData.Phone);
            mapClient.Put("NotificationToken", clientLoggedData.Token);
            
            if(clientLoggedData.MedicSubscribed != null)
            {
                if(clientLoggedData.MedicSubscribed.Id == medicSelected.Id)
                {
                    AlertDialog.Builder alreadySubscribedDialog = new AlertDialog.Builder(this);
                    alreadySubscribedDialog.SetTitle("Abonare");
                    alreadySubscribedDialog.SetMessage("Sunteti deja abonat la acest medic!");
                    alreadySubscribedDialog.SetNeutralButton("Ok", delegate
                     {
                         alreadySubscribedDialog.Dispose();
                     });
                    alreadySubscribedDialog.Show();
                }
                else
                {
                    AlertDialog.Builder subscribeToAnotherMedic = new AlertDialog.Builder(this);
                    subscribeToAnotherMedic.SetTitle("Abonare la alt medic");
                    subscribeToAnotherMedic.SetMessage($"Doriti sa va abonati la {medicSelected.FirstName}, {medicSelected.LastName}?");

                    subscribeToAnotherMedic.SetPositiveButton("Da", async delegate
                     {
                      
                         Models.Notification newNotif = new Models.Notification()
                         {
                             Type = clientLoggedData.MedicSubscribed.Id,
                             MedicId = medicSelected.Id,
                             Description = clientLoggedData.Id,
                         };
                         await _functionsService.AddNotification(newNotif, "medicMigrate");

                         // TODO: check if client has been added
                         clientLoggedData.MedicSubscribed = medicSelected;
                         await _storageService.SaveClientDataLocal(clientLoggedData);
                         subscribeToAnotherMedic.Dispose();
                     });
                    subscribeToAnotherMedic.SetNegativeButton("Nu", delegate
                     {
                         subscribeToAnotherMedic.Dispose();
                     });

                    subscribeToAnotherMedic.Show();
                }
            }
            else 
            { 
                AlertDialog.Builder subscribeDialog = new AlertDialog.Builder(this);
                subscribeDialog.SetTitle("Abonare");
                subscribeDialog.SetMessage($"Doriti sa va abonati la {medicSelected.FirstName}, {medicSelected.LastName}?");
            
                subscribeDialog.SetPositiveButton("Da",async delegate
                 {
                     // add Client to that medic DataBase
                     _firestoreDb.Collection("Medics").Document(medicSelected.Id).Collection("Clients").Document(clientLoggedData.Id).Set(mapClient)
                                .AddOnFailureListener(this);
                     clientLoggedData.MedicSubscribed = medicSelected;
                     // storing also medic that the user has subscribed to
                     await _storageService.SaveClientDataLocal(clientLoggedData);
                     Models.Notification newNotif = new Models.Notification()
                     {
                         Description = $"{clientLoggedData.FirstName}, {clientLoggedData.LastName} s-a abonat la dumneavoastra.",
                         Type = "Client nou",
                         Timestamp = DateTime.Now.ToLocalTime(),
                         MedicId = clientLoggedData.MedicSubscribed.Id,
                     };

                     await _functionsService.AddNotification(newNotif, "notificationCreate");
                     subscribeDialog.Dispose();
                 });
                subscribeDialog.SetNegativeButton("Nu", delegate
                 {
                     subscribeDialog.Dispose();
                 });
                subscribeDialog.Show();
            }
        }

        public void OnFailure(Java.Lang.Exception e)
        {
            var source = e.Cause;
            var errorType = e.GetType();
            Console.WriteLine("Exception caught: ", e.GetType());
        }
    }
}