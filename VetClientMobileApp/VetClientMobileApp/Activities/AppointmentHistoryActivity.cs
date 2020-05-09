using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

using Android.App;
using Android.Content;
using Android.OS;
using Android.Runtime;
using Android.Views;
using Android.Widget;
using Firebase.Firestore;
using Java.Util;
using Newtonsoft.Json;
using VetClientMobileApp.Adapter;
using VetClientMobileApp.EventListeners;
using VetClientMobileApp.Models;
using VetClientMobileApp.Services;

namespace VetClientMobileApp.Activities
{
    [Activity(Label = "AppointmentHistoryActivity")]
    public class AppointmentHistoryActivity : Activity
    {
        private FirebaseFirestore _firestoreDb;
        private readonly IUserService _userService;
        private readonly StorageService _storage;
        private Client _clientLogged;
        private ListView _oldAppointsLst;
        private Animal _animalSelected;
        private TextView _noAppointsTxt;
        public AppointmentHistoryActivity()
        {
            _userService = new UserService();
            _storage = new StorageService();
        }
        protected async override void OnCreate(Bundle savedInstanceState)
        {
            base.OnCreate(savedInstanceState);
            _clientLogged = await _storage.GetClientDataLocal();
            _animalSelected = JsonConvert.DeserializeObject<Animal>(Intent.GetStringExtra("Animal"));
            // Create your application here
            SetContentView(Resource.Layout.pet_history_main);
            _firestoreDb = _userService.GetDatabase(this);
            _noAppointsTxt = FindViewById<TextView>(Resource.Id.no_appoints_txt);

            _oldAppointsLst = FindViewById<ListView>(Resource.Id.lstView_appoint_history);

            FetchOldAppointments();
        }

        private void FetchOldAppointments()
        {
            TaskCompletionListener appointsListener = new TaskCompletionListener();
            appointsListener.Succes += AppointsListener_Succes;
            appointsListener.Failure += AppointsListener_Failure;

            if (_clientLogged != null)
            {
                _firestoreDb.Collection("Medics").Document(_clientLogged.MedicSubscribed.Id).Collection("Appointments")
                    .WhereEqualTo("animalName", _animalSelected.Name).WhereEqualTo("clientId", _clientLogged.Id).WhereLessThan("startTime", new Date())
                    .Get().AddOnSuccessListener(appointsListener)
                    .AddOnFailureListener(appointsListener);
            }
        }

        private void AppointsListener_Failure(object sender, EventArgs e)
        {
            var exception = (System.Exception)sender;
            Toast.MakeText(this, "Fetching appointments failed!", ToastLength.Long);
        }

        private void AppointsListener_Succes(object sender, EventArgs e)
        {
            var snapshot = (QuerySnapshot)sender;
            List<Appointment> oldAppointments = _userService.GetAppointments(snapshot);
            if(oldAppointments == null)
            {
                _noAppointsTxt.Text = $"{_animalSelected.Name} doesn't have any appointments.";
            }
            else
            {
                _oldAppointsLst.Adapter = new AppointmentAdapter(oldAppointments.ToArray(), this,false);
            }       
        }
    }
}