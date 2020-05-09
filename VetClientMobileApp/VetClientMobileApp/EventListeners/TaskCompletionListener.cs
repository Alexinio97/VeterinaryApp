using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

using Android.App;
using Android.Content;
using Android.Gms.Tasks;
using Android.OS;
using Android.Runtime;
using Android.Views;
using Android.Widget;

namespace VetClientMobileApp.EventListeners
{
    class TaskCompletionListener : Java.Lang.Object, IOnSuccessListener, IOnFailureListener
    {
        
        public event EventHandler Succes;
        public event EventHandler Failure;

        public void OnFailure(Java.Lang.Exception e)
        {
            Failure?.Invoke(e,new EventArgs());
        }

        public void OnSuccess(Java.Lang.Object result)
        {
            Succes?.Invoke(result, new EventArgs());
        }
    }
}