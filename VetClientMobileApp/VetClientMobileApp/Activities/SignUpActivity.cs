using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

using Android.App;
using Android.Content;
using Android.OS;
using Android.Runtime;
using Android.Support.Design.Widget;
using Android.Views;
using Android.Widget;
using VetClientMobileApp.Models;
using VetClientMobileApp.Services;

namespace VetClientMobileApp.Activities
{
    [Activity(Label = "SignUpActivity")]
    public class SignUpActivity : Activity
    {
        // view  inputs
        TextView firstName;
        TextView lastName;
        TextView email;
        TextView phone;
        TextView password;
        Button signUp;
        Button toLogin_btn;

        private readonly IUserService _userService;
        private readonly StorageService _storageService;
        public SignUpActivity()
        {
            _userService = new UserService();
            _storageService = new StorageService();
        }

        protected override void OnCreate(Bundle savedInstanceState)
        {
            base.OnCreate(savedInstanceState);
            SetContentView(Resource.Layout.signUp);
            // Create your application here

            firstName = FindViewById<TextView>(Resource.Id.txt_firstName);
            lastName = FindViewById<TextView>(Resource.Id.txt_lastName);
            email = FindViewById<TextView>(Resource.Id.txt_email);
            phone = FindViewById<TextView>(Resource.Id.txt_phone);
            password = FindViewById<TextView>(Resource.Id.txt_password);

            signUp = FindViewById<Button>(Resource.Id.SignUp_btn);
            toLogin_btn = FindViewById<Button>(Resource.Id.toLogin_btn);

            signUp.Click += SignUp_Click;
            toLogin_btn.Click += ToLoginView_Click;

           
        }

        private void ToLoginView_Click(object sender, EventArgs e)
        {
            StartActivity(typeof(LogInActivity));
        }

        private async void SignUp_Click(object sender, EventArgs e)
        {
            
            if (firstName.Text.Any(char.IsDigit))
            {
                firstName.Error = "Nu poate contine numere!";
                return;
            }
            if (lastName.Text.Any(char.IsDigit))
            {
                lastName.Error = "Nu poate contine numere!";
                return;
            }
            if(password.Text.Length <=6)
            {
                password.Error = "Parola trebuie sa aiba minim 6 caractere.";
                return;
            }

            Client newClient = new Client()
            {
                FirstName = firstName.Text,
                LastName = lastName.Text,
                Email = email.Text,
                Password = password.Text,
                Phone = phone.Text,
            };

            try { 
                var auth = _userService.GetAuth(this);
                signUp.Enabled = false;
                toLogin_btn.Enabled = false;
                var result = await auth.CreateUserWithEmailAndPasswordAsync(newClient.Email, newClient.Password);
                // don't save password in database
                newClient.Password = null;
                newClient.Id = auth.CurrentUser.Uid;    // store the id returned by database in order to insert it into the database
                newClient.Token = await System.Threading.Tasks.Task.Run(() => _userService.GetTokenAsync(this));
                await _storageService.SaveClientDataLocal(newClient);

                AlertDialog.Builder succesDialog = new AlertDialog.Builder(this);
                succesDialog.SetTitle("Succes");
                succesDialog.SetMessage($"Contul a fost creeat!");

                succesDialog.SetNeutralButton("Ok", delegate
                {
                    auth.SignOut();
                    succesDialog.Dispose();
                    StartActivity(typeof(LogInActivity));
                });
                succesDialog.Show();
                
            }
            catch(Exception ex)
            {
                var login_view = FindViewById<RelativeLayout>(Resource.Id.signUp_view);
                Snackbar snackbar = Snackbar.Make(login_view, "Nu s-a putut crea contul!", Snackbar.LengthShort);
                snackbar.Show();
                Console.WriteLine("Exception caught: ", ex.Message);
                signUp.Enabled = true;
                toLogin_btn.Enabled = true;
            }

        }
    }
}