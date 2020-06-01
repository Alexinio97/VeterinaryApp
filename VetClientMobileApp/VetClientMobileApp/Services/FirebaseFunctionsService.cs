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
using Firebase;
using Firebase.Functions;
using Java.Util;
using Newtonsoft.Json;
using VetClientMobileApp.EventListeners;

namespace VetClientMobileApp.Services
{
    class FirebaseFunctionsService
    {
        FirebaseFunctions firebaseFunc;
        private readonly Android.Content.Context _context;
        private readonly Activity _activity;
        TaskCompletionSource<bool> isRunning;
        public FirebaseFunctionsService(Android.Content.Context context, Activity activity)
        {
            _activity = activity;
            _context = context;
            isRunning = new TaskCompletionSource<bool>();
        }

        public async Task AddNotification(Models.Notification newNotif,string functionCall)
        {
            TaskCompletionListener taskCompletionListener = new TaskCompletionListener();
            var app = FirebaseApp.InitializeApp(_context);
            firebaseFunc = FirebaseFunctions.GetInstance(app);

            var func = firebaseFunc.GetHttpsCallable(functionCall)
            .Call(JsonConvert.SerializeObject(newNotif))
            .AddOnSuccessListener(_activity, taskCompletionListener);
            taskCompletionListener.Succes += TaskCompletionListener_Succes;
            taskCompletionListener.Failure += TaskCompletionListener_Failure;

        }

        private void TaskCompletionListener_Failure(object sender, EventArgs e)
        {
            Java.Lang.Exception ex = (Java.Lang.Exception)sender;
            Console.WriteLine("Exception caught: ",ex.ToString());
        }

        private void TaskCompletionListener_Succes(object sender, EventArgs e)
        {
            Console.WriteLine("Sent succesfull!");
            isRunning.SetResult(true);
        }
    }
}