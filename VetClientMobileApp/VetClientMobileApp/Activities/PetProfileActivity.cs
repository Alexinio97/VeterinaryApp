using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Android.App;
using Android.Content;
using Android.OS;
using Android.Runtime;
using Android.Views;
using Android.Widget;
using FFImageLoading;
using Firebase.Storage;
using Newtonsoft.Json;
using VetClientMobileApp.Models;
using VetClientMobileApp.Services;
using Com.Syncfusion.Schedule;
using VetClientMobileApp.EventListeners;
using Firebase.Firestore;

namespace VetClientMobileApp.Activities
{
    [Activity(Label = "PetProfileActivity")]
    public class PetProfileActivity : Activity
    {
        private Animal animalSelected;
        private readonly IUserService _userService;
        private Client clientLogged;
        private readonly StorageService _storageService;
        private ProgressDialog progress;
        public PetProfileActivity()
        {
            _userService = new UserService();
            _storageService = new StorageService();
        }
        protected async override void OnCreate(Bundle savedInstanceState)
        {
            base.OnCreate(savedInstanceState);
            SetContentView(Resource.Layout.pet_profile_layout);

            animalSelected = JsonConvert.DeserializeObject<Animal>(Intent.GetStringExtra("Animal"));

            var pet_name = FindViewById<TextView>(Resource.Id.pet_name_text);
            var pet_age = FindViewById<TextView>(Resource.Id.pet_age_txt);
            var pet_breed = FindViewById<TextView>(Resource.Id.pet_breed_txt);
            var pet_neutered = FindViewById<TextView>(Resource.Id.pet_neutered_text);
            var pet_photo = FindViewById<ImageView>(Resource.Id.petProfilePhoto);

            clientLogged = await _storageService.GetClientDataLocal();

            pet_name.Text = "Nume: " + animalSelected.Name;
            pet_age.Text = "Varsta: " + animalSelected.Age.ToString();
            pet_breed.Text = "Specie: " + animalSelected.Breed.ToString();
            pet_neutered.Text = "Sterilizat/Castrat: " + animalSelected.Neutered.ToString();

            var makeAnAppointmentBtn = FindViewById<Button>(Resource.Id.btn_MakeAppointment);
            makeAnAppointmentBtn.Click += MakeAnAppointmentBtn_Click;

            var viewAppointmentsHistory = FindViewById<Button>(Resource.Id.btn_AppointmentHistory);
            viewAppointmentsHistory.Click += ViewAppointmentsHistory_Click;

            var _storage = _userService.GetStorage(this);

            var url = await GetFile(animalSelected.Photo, _storage);

            if (url != null)
            {
                await DisplayPhoto(url.ToString(), pet_photo);
            }
        }

        private void ViewAppointmentsHistory_Click(object sender, EventArgs e)
        {
            Intent animalOldAppoints = new Intent(this, typeof(AppointmentHistoryActivity));
            animalOldAppoints.PutExtra("Animal", JsonConvert.SerializeObject(animalSelected));
            StartActivity(animalOldAppoints);
        }

        private void MakeAnAppointmentBtn_Click(object sender, EventArgs e)
        {
            progress = new ProgressDialog(this);
            progress.Indeterminate = false;
            progress.SetProgressStyle(Android.App.ProgressDialogStyle.Spinner);
            progress.SetMessage("Va rugam asteptati...");
            progress.SetCancelable(false);
            progress.Show();
            SetMedicScheduleHours();
        }

        public async Task DisplayPhoto(string url, ImageView photo)
        {
            ImageService.Instance.LoadUrl(url)
                .Retry(3, 200)
                .DownSample(600, 600)
                .Into(photo);
        }

        public async Task<Android.Net.Uri> GetFile(string fileName, FirebaseStorage storage)
        {
            return await storage.Reference
                .Child("animalProfilePics")
                .Child(fileName)
                .GetDownloadUrlAsync();
        }

        public void SetMedicScheduleHours()
        {
            var firestoreDb = _userService.GetDatabase(this);
            // get medic schedule
            TaskCompletionListener medicsListener = new TaskCompletionListener();
            medicsListener.Succes += MedicsListener_Succes;
            medicsListener.Failure += MedicsListener_Failure;
            firestoreDb.Collection("Medics").Document(clientLogged.MedicSubscribed.Id).Get().AddOnSuccessListener(medicsListener)
                .AddOnFailureListener(medicsListener);
        }

        private void MedicsListener_Failure(object sender, EventArgs e)
        {
            var exception = (Java.Lang.Exception)sender;
            Console.WriteLine("Exception caught: ", exception.Message);
        }

        private async void MedicsListener_Succes(object sender, EventArgs e)
        {
            double[] scheduleHours = new double[2];

            var snapshot = (DocumentSnapshot)sender;
            if (snapshot.Exists())
            {
                var document = snapshot;

                var scheduleReceived = document.Get("Schedule");
                if (scheduleReceived != null)
                {
                    var dictHasMap = new JavaDictionary<string, string>(scheduleReceived.Handle, Android.Runtime.JniHandleOwnership.DoNotRegister);
                    foreach (KeyValuePair<string, string> item in dictHasMap)
                    {
                        clientLogged.MedicSubscribed.Schedule[item.Key] = item.Value;
                    }

                }
                else
                {
                    // set some default values
                    clientLogged.MedicSubscribed.Schedule["start"] = "09:00";
                    clientLogged.MedicSubscribed.Schedule["end"] = "17:00";
                }

                await _storageService.SaveClientDataLocal(clientLogged);
                progress.Dismiss();
                Intent animalAppointments = new Intent(this, typeof(AnimalAppointments));
                animalAppointments.PutExtra("Animal", JsonConvert.SerializeObject(animalSelected));
                StartActivity(animalAppointments);
            }
        }
    }
}