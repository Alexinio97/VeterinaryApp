﻿using System;
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
using Firebase.Firestore;
using Java.Util;
using VetClientMobileApp.Adapter;
using VetClientMobileApp.EventListeners;
using VetClientMobileApp.Models;
using VetClientMobileApp.Services;

namespace VetClientMobileApp.Activities
{
    [Activity(Label = "UpcomingAppointmentsActivity")]
    public class UpcomingAppointmentsActivity : Activity
    {
        private readonly StorageService _storageService;
        private FirebaseFirestore _firestoreDb;
        private readonly IUserService _userService;
        private Client _clientLogged;
        private ListView upcomingAppoints;
        private TextView noAppointsTxt;
        private ProgressDialog progress;
        public UpcomingAppointmentsActivity()
        {
            _storageService = new StorageService();
            _userService = new UserService();
        }
        protected async override void OnCreate(Bundle savedInstanceState)
        {
            base.OnCreate(savedInstanceState);
            _clientLogged = await _storageService.GetClientDataLocal();
     
            SetContentView(Resource.Layout.upcoming_appointments_main);
            if (_clientLogged.MedicSubscribed == null)
            {
                Toast.MakeText(this, "Abonati-va la un medic mai intai!", ToastLength.Long).Show();
                StartActivity(typeof(MainActivity));
                return;
            }
            upcomingAppoints = FindViewById<ListView>(Resource.Id.lstView_upcoming_appoints);
            noAppointsTxt = FindViewById<TextView>(Resource.Id.no_upcoming_appoints_txt);
            _firestoreDb = _userService.GetDatabase(this);

            progress = new ProgressDialog(this);
            progress.Indeterminate = false;
            progress.SetProgressStyle(Android.App.ProgressDialogStyle.Spinner);
            progress.SetMessage("Se afiseaza programarile viitoare...");
            progress.SetCancelable(false);
            progress.Show();
            GetAllAnimalsAppoints();
        }

        private void GetAllAnimalsAppoints()
        {
            TaskCompletionListener appointsListener = new TaskCompletionListener();
            appointsListener.Succes += AppointsListener_Succes;
            appointsListener.Failure += AppointsListener_Failure;

            if (_clientLogged != null)
            {
                _firestoreDb.Collection("Medics").Document(_clientLogged.MedicSubscribed.Id).Collection("Appointments")
                    .WhereEqualTo("clientId", _clientLogged.Id).WhereGreaterThan("startTime", new Date())
                    .Get().AddOnSuccessListener(appointsListener)
                    .AddOnFailureListener(appointsListener);
            }
        }

        private void AppointsListener_Failure(object sender, EventArgs e)
        {
            var exception = (Java.Lang.Exception)sender;
        }

        private void AppointsListener_Succes(object sender, EventArgs e)
        {
            var snapshot = (QuerySnapshot)sender;
            List<Appointment> upcomingAppointments = _userService.GetAppointments(snapshot);
            if (upcomingAppointments == null)
            {
                noAppointsTxt.Text = "Nici-o programare viitoare";
            }
            else
            {
                upcomingAppoints.Adapter = new AppointmentAdapter(upcomingAppointments.ToArray(), this,true);   
            }
            progress.Dismiss();
        }
    }
}