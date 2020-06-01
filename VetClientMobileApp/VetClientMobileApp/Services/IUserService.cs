using Firebase.Auth;
using Firebase.Firestore;
using Firebase.Storage;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using VetClientMobileApp.Models;

namespace VetClientMobileApp.Services
{
    interface IUserService
    {
        public Task<LoginModel> Authenticate(string email, string password,FirebaseAuth auth);

        public Task<IAuthResult> Register(Client client,FirebaseAuth auth);
        public Task<string> GetTokenAsync(Android.Content.Context context);

        public FirebaseFirestore GetDatabase(Android.Content.Context context);
        public FirebaseAuth GetAuth(Android.Content.Context context);

        public FirebaseStorage GetStorage(Android.Content.Context context);
        public List<Appointment> GetAppointments(QuerySnapshot snapshot);
    }
}
