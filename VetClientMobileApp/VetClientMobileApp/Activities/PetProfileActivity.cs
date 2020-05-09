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

namespace VetClientMobileApp.Activities
{
    [Activity(Label = "PetProfileActivity")]
    public class PetProfileActivity : Activity
    {
        private Animal animalSelected;
        private readonly IUserService _userService;
       
        public PetProfileActivity()
        {
            _userService = new UserService();
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


            pet_name.Text = "Name: " +animalSelected.Name;
            pet_age.Text = "Age: " + animalSelected.Age.ToString();
            pet_breed.Text = "Breed: " + animalSelected.Breed.ToString();
            pet_neutered.Text = "Neutered: " + animalSelected.Neutered.ToString();

            var makeAnAppointmentBtn = FindViewById<Button>(Resource.Id.btn_MakeAppointment);
            makeAnAppointmentBtn.Click += MakeAnAppointmentBtn_Click;

            var viewAppointmentsHistory = FindViewById<Button>(Resource.Id.btn_AppointmentHistory);
            viewAppointmentsHistory.Click += ViewAppointmentsHistory_Click;

            var _storage = _userService.GetStorage();

            var url = await GetFile(animalSelected.Photo, _storage);
            if(url != null)
            {
                await DisplayPhoto(url, pet_photo);
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
            Intent animalAppointments = new Intent(this, typeof(AnimalAppointments));
            animalAppointments.PutExtra("Animal", JsonConvert.SerializeObject(animalSelected));
            StartActivity(animalAppointments);
        }

        public async Task DisplayPhoto(string url,ImageView photo)
        {
            ImageService.Instance.LoadUrl(url)
                .Retry(3, 200)
                .DownSample(600, 600)
                .Into(photo);
        }

        public async Task<string> GetFile(string fileName, FirebaseStorage storage)
        {
            return await storage
                .Child("animalProfilePics")
                .Child(fileName)
                .GetDownloadUrlAsync();
        }
    }
}