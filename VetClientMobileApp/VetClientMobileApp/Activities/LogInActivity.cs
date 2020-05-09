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
using Firebase.Auth;
using VetClientMobileApp.Services;

namespace VetClientMobileApp.Activities
{
    [Activity(Label = "LogInActivity",MainLauncher = true)]
    public class LogInActivity : Activity 
    {
        Android.Support.Design.Widget.TextInputEditText password;
        EditText email;
        private readonly UserService _userService;
        public LogInActivity()
        {
            _userService = new UserService();
        }
        protected override void OnCreate(Bundle savedInstanceState)
        {
            base.OnCreate(savedInstanceState);
            var auth = _userService.GetAuth(this);
            
            if(auth.Uid != null)
            {
                StartActivity(typeof(MainActivity));
            }
            SetContentView(Resource.Layout.login);

            email = FindViewById<EditText>(Resource.Id.txtEmail);
            password = FindViewById<Android.Support.Design.Widget.TextInputEditText>(Resource.Id.txtPassword);

            var button = FindViewById<Button>(Resource.Id.LogIn_btn);
            button.Click += DoLogin;

            var signUp_btn = FindViewById<Button>(Resource.Id.toSignUp);
            signUp_btn.Click += SignUp_btn;
        }



        private async void DoLogin(object sender, EventArgs e)
        {
            try
            {
                var auth = _userService.GetAuth(this);
                var result = await _userService.Authenticate(email.Text, password.Text,auth);
                if (result == null)
                {
                    var login_view = FindViewById<LinearLayout>(Resource.Id.login_view);
                    Snackbar snackbar = Snackbar.Make(login_view, "Wrong email/password!", Snackbar.LengthShort);
                    snackbar.Show();
                }
                else
                {
                    StartActivity(typeof(MainActivity));
                    Toast.MakeText(this, "Succesfull login!", ToastLength.Long).Show();
                }
                
            }
            catch(Exception ex)
            {
                Console.WriteLine("Exception caught: ", ex.Message);
            }
        }

        private void SignUp_btn(object sender,EventArgs e)
        {
            StartActivity(typeof(SignUpActivity));
        }
    }
}