using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

using Android.App;
using Android.Content;
using Android.Gms.Tasks;
using Android.OS;
using Android.Runtime;
using Android.Support.Design.Widget;
using Android.Views;
using Android.Widget;
using Firebase.Firestore;
using Newtonsoft.Json;
using VetClientMobileApp.Adapter;
using VetClientMobileApp.Models;
using VetClientMobileApp.Services;

namespace VetClientMobileApp.Activities
{
    [Activity(Label = "PetsActivity")]
    public class PetsActivity : Activity , IOnSuccessListener, IOnFailureListener
    {
        private readonly IUserService _userService;
        private List<Animal> animalsFetched;
        private FirebaseFirestore _firestoreDb;
        private ListView animalListView;
        private readonly StorageService _storageService;
        private Client clientLogged;
        ProgressDialog progress;
        public PetsActivity()
        {
            _userService = new UserService();
            animalsFetched = new List<Animal>();
            _storageService = new StorageService();
        }

        protected async override void OnCreate(Bundle savedInstanceState)
        {
            base.OnCreate(savedInstanceState);
            clientLogged = await _storageService.GetClientDataLocal();
            
            // Create your application here
            SetContentView(Resource.Layout.pets);
            if (clientLogged.MedicSubscribed == null)
            {
                Toast.MakeText(this, "Abonati-va la un medic mai intai!", ToastLength.Long).Show();
                StartActivity(typeof(MainActivity));
                return;
            }
            _firestoreDb = _userService.GetDatabase(this);
            animalListView = FindViewById<ListView>(Resource.Id.lstView_Pets);

            
            progress = new ProgressDialog(this);
            progress.Indeterminate = false;
            progress.SetProgressStyle(Android.App.ProgressDialogStyle.Spinner);
            progress.SetMessage("Asteptati...");
            progress.SetCancelable(false);
            progress.Show();
            FetchData();
        }

        private void FetchData()
        {
            try
            { 
                // add on success listener
                _firestoreDb.Collection("Medics").Document(clientLogged.MedicSubscribed.Id).Collection("Clients").Document(clientLogged.Id).Collection("Animals")
                    .Get().AddOnSuccessListener(this).AddOnFailureListener(this);
            }
            catch (System.Exception ex)
            {
                Console.WriteLine("Error fetching pets:", ex.Message);
                Toast.MakeText(this, "Error fetching pets!", ToastLength.Long);
            }
        }


        public void OnFailure(Java.Lang.Exception e)
        {
            Console.WriteLine("Error caught");
        }

        public void OnSuccess(Java.Lang.Object result)
        {
            var snapshot = (QuerySnapshot)result;

            if (!snapshot.IsEmpty)
            {
                var documents = snapshot.Documents;

                animalsFetched.Clear();
                foreach (var document in documents)
                {
                    Animal newAnimal = new Animal();

                    // populate medics data
                    newAnimal.Id = document.Id;
                    newAnimal.Name = document.Get("Name").ToString();
                    newAnimal.Breed = document.Get("Breed").ToString();
                    newAnimal.Species = (Species)document.GetDouble("Species").IntValue();
                    newAnimal.Neutered = (Neutered)document.GetDouble("Neutered").IntValue();
                    newAnimal.Age = document.GetDouble("Age").IntValue();
                    newAnimal.Photo = document.Get("Photo").ToString();

                    animalsFetched.Add(newAnimal);
                }
                animalListView.Adapter = new PetAdapter( animalsFetched.ToArray(),this);
                animalListView.ItemClick += AnimalListView_ItemClick;
            }
            progress.Dismiss();
        }

        private void AnimalListView_ItemClick(object sender, AdapterView.ItemClickEventArgs e)
        {
            // go to petProfile
            Intent profile = new Intent(this, typeof(PetProfileActivity));
            profile.PutExtra("Animal", JsonConvert.SerializeObject(animalsFetched[e.Position]));
            StartActivity(profile);

        }
    }
}