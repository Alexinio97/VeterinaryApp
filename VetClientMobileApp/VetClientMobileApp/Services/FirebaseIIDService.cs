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
using Android.Util;
using Firebase.Messaging;
using Android.Support.V4.App;

namespace VetClientMobileApp.Services
{
    [Service]
    [IntentFilter(new [] { "com.google.firebase.MESSAGING_EVENT" })]
    public class FirebaseIIDService : FirebaseMessagingService
    {
        const string TAG = "MyFirebaseIIDService";
        public override void OnNewToken(string p0)
        {
            // TODO: send this tokens into firestore and use them in react js to send notifications to a specific user
            base.OnNewToken(p0);
            Log.Debug(TAG, "New Token:" + p0);
            SendRegistrationToServer(p0);
        }
        public override void OnMessageReceived(RemoteMessage message)
        {
            Log.Debug(TAG,"Message received!");
            Log.Debug(TAG, "From: " + message.From);
            Log.Debug(TAG, "Notification Message Body: " + message.GetNotification().Body);
            SendNotification(message.GetNotification().Body,message.Data);
        }

        void SendNotification(string messageBody, IDictionary<string, string> data)
        {
            var intent = new Intent(this, typeof(MainActivity));
            intent.AddFlags(ActivityFlags.ClearTop);
            foreach (var key in data.Keys)
            {
                intent.PutExtra(key, data[key]);
            }

            var pendingIntent = PendingIntent.GetActivity(this,
                                                          MainActivity.NOTIFICATION_ID,
                                                          intent,
                                                          PendingIntentFlags.OneShot);

            var notificationBuilder = new NotificationCompat.Builder(this, MainActivity.CHANNEL_ID)
                                      .SetSmallIcon(Resource.Drawable.animals)
                                      .SetContentTitle("Daily Vet")
                                      .SetContentText(messageBody)
                                      .SetAutoCancel(true)
                                      .SetContentIntent(pendingIntent);

            var notificationManager = NotificationManagerCompat.From(this);
            notificationManager.Notify(MainActivity.NOTIFICATION_ID, notificationBuilder.Build());
        }

        private void SendRegistrationToServer(string p0)
        {
            //
        }
    }
}