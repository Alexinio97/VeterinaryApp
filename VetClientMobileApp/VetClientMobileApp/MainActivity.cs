using System;
using Android;
using Android.App;
using Android.OS;
using Android.Runtime;
using Android.Support.Design.Widget;
using Android.Support.V4.View;
using Android.Support.V4.Widget;
using Android.Support.V7.App;
using Android.Views;
using Android.Widget;
using VetClientMobileApp.Activities;
using VetClientMobileApp.Services;
using Firebase.Messaging;
using Firebase.Iid;
using Android.Util;
using Android.Gms.Common;
using VetClientMobileApp.Models;
using VetClientMobileApp.EventListeners;
using Firebase.Firestore;
using System.Collections.Generic;
using VetClientMobileApp.Adapter;
using Android.Content;
using System.Threading.Tasks;
using Java.Util;

namespace VetClientMobileApp
{
    [Activity(Label = "@string/app_name", Theme = "@style/AppTheme.NoActionBar", MainLauncher = false)]
    public class MainActivity : AppCompatActivity, NavigationView.IOnNavigationItemSelectedListener
    {
        private readonly StorageService _storageService;
        private readonly IUserService _userService;
        // array for setting multiple reminders for all treatments
        List<PendingIntent> _pendingIntents;

        List<Treatment> _treatments;
        Client clientLogged;
        ListView _treatmentsView;
        static readonly string TAG = "MainActivity";

        internal static readonly string CHANNEL_ID = "my_notification_channel";
        internal static readonly int NOTIFICATION_ID = 100;
        TextView msgText;
        public MainActivity()
        {
            _userService = new UserService();
            _storageService = new StorageService();
            _treatments = new List<Treatment>();
            _pendingIntents = new List<PendingIntent>();
        }

        protected async override void OnCreate(Bundle savedInstanceState)
        {
            base.OnCreate(savedInstanceState);
            Syncfusion.Licensing.SyncfusionLicenseProvider.RegisterLicense("MDAxQDMxMzgyZTMxMmUzMFBaV0NxZ2pGSVNNQ0orZm0xMTVsZjBtZXBpYnY4cGcwV2ZOS3JueHI1bkU9");
            Xamarin.Essentials.Platform.Init(this, savedInstanceState);
            SetContentView(Resource.Layout.activity_main);
            Android.Support.V7.Widget.Toolbar toolbar = FindViewById<Android.Support.V7.Widget.Toolbar>(Resource.Id.toolbar);
            SetSupportActionBar(toolbar);

            FloatingActionButton fab = FindViewById<FloatingActionButton>(Resource.Id.fab);
            _treatmentsView = FindViewById<ListView>(Resource.Id.lstView_treatments);
            clientLogged = await _storageService.GetClientDataLocal();
            fab.Click += FabOnClick;
            // check google play services
            msgText = FindViewById<TextView>(Resource.Id.msgText);
          
            IsPlayServicesAvailable();
            CreateNotificationChannel();
            FetchTreatments();

            // alarm set 
            

            DrawerLayout drawer = FindViewById<DrawerLayout>(Resource.Id.drawer_layout);
            ActionBarDrawerToggle toggle = new ActionBarDrawerToggle(this, drawer, toolbar, Resource.String.navigation_drawer_open, Resource.String.navigation_drawer_close);
            drawer.AddDrawerListener(toggle);
            toggle.SyncState();

            NavigationView navigationView = FindViewById<NavigationView>(Resource.Id.nav_view);
            navigationView.SetNavigationItemSelectedListener(this);
        }
        // verify that Google Play Services is available before the app attempts to use FCM services
        public bool IsPlayServicesAvailable()
        {
            int resultCode = GoogleApiAvailability.Instance.IsGooglePlayServicesAvailable(this);
            if(resultCode != ConnectionResult.Success)
            {
                if (GoogleApiAvailability.Instance.IsUserResolvableError(resultCode))
                {
                    Console.WriteLine(GoogleApiAvailability.Instance.GetErrorString(resultCode));
                }
                else
                {
                    Finish();
                }
                return false;
            }
            else
            {
                
                return true;
            }
        }

        public void FetchTreatments()
        {
            var db = _userService.GetDatabase(this);
 
            TaskCompletionListener treatmentsListener = new TaskCompletionListener();
            treatmentsListener.Succes += TreatmentsListener_Succes;
            treatmentsListener.Failure += TreatmentsListener_Failure;

            db.Collection("Medics").Document(clientLogged.MedicSubscribed.Id).Collection("Clients").Document(clientLogged.Id).Collection("Treatments")
                .Get().AddOnSuccessListener(treatmentsListener).AddOnFailureListener(treatmentsListener);
        }

        private void TreatmentsListener_Failure(object sender, EventArgs e)
        {
            var exception = (Java.Lang.Exception)sender;
            Console.WriteLine("Exception caught: ", exception.ToString());
        }

        private void TreatmentsListener_Succes(object sender, EventArgs e)
        {
            var snapshot = (QuerySnapshot)sender;
            if (!snapshot.IsEmpty)
            {
                var documents = snapshot.Documents;
                try
                {
                    _treatments.Clear();
                    foreach (var document in documents)
                    {
                        Treatment treatment = new Treatment();
                        treatment.Id = document.Id;
                        treatment.FinalDate = document.GetDate("finalDate");
                        treatment.Dosage = int.Parse(document.GetString("dosage"));
                        treatment.Frequency = (Frequency)int.Parse(document.GetString("frequency"));
                        treatment.Name = document.GetString("treatment");
                        treatment.AnimalName = document.GetString("animalName");
                        if(document.GetString("alarmTime") != null)
                        {
                            treatment.AlarmTime = document.GetString("alarmTime");
                        }

                        _treatments.Add(treatment);
                    }
                    if(_treatments.Count < 1)
                    {
                        msgText.Text = "Nici-un tratament activ!";
                        return;
                    }
                    _treatmentsView.Adapter = new TreatmentAdapter(_treatments.ToArray(), this);
                    _treatmentsView.ItemClick += _treatmentsView_ItemClick;
                    
                }
                catch (Exception ex)
                {
                    Console.WriteLine("Error caught: ", ex.Message);
                    Toast.MakeText(this, "Eroare la vizualizarea tratamentelor!", ToastLength.Long);
                }
            }
        }

        private async void _treatmentsView_ItemClick(object sender, AdapterView.ItemClickEventArgs e)
        {
            var treatment = _treatments[e.Position];
            var alarmIntent = new Intent(this, typeof(AlarmReceiver));
            alarmIntent.PutExtra("title", "Tratament " + treatment.Name);
            alarmIntent.PutExtra("message", "Nu uitati tratamentul pentru " + treatment.AnimalName + " de " + treatment.Dosage.ToString() + " pe zi.");

            var pendingIntent = PendingIntent.GetBroadcast(this, e.Position, alarmIntent,
                PendingIntentFlags.UpdateCurrent);

            Java.Util.Calendar alarmTrigger = Java.Util.Calendar.Instance;

            
            // Set the alarm
            var alarmManager = GetSystemService(AlarmService).JavaCast<AlarmManager>();
            if(treatment.AlarmTime != null )
            {
                var dialogAlarm = new Android.Support.V7.App.AlertDialog.Builder(this);
                dialogAlarm.SetTitle("Setare sau anulare alarma");
                dialogAlarm.SetMessage("Anulati alarma sau setati una noua?");
                dialogAlarm.SetPositiveButton("Anuleaza", delegate
                 {
                     alarmManager.Cancel(pendingIntent);
                     DeleteAlarmTime(treatment);
                     _treatments[e.Position].AlarmTime = null;
                     _treatmentsView.Adapter = new TreatmentAdapter(_treatments.ToArray(), this);
                     dialogAlarm.Dispose();
                 });
                dialogAlarm.SetNegativeButton("Seteaza", delegate
                {
                    SetTime(alarmTrigger, treatment, pendingIntent, alarmManager, e.Position);
                    dialogAlarm.Dispose();
                });
                dialogAlarm.Show();
            }
            else
            {
                SetTime(alarmTrigger, treatment, pendingIntent, alarmManager, e.Position);
            }
            
            
        }

        private void SetTime(Calendar alarmTrigger,Treatment treatment,PendingIntent pendingIntent,AlarmManager alarmManager,int position)
        {
            //set time
            AlarmPickerFragment frag = AlarmPickerFragment.NewInstance(
            delegate (DateTime time)
            {
                string[] timePicked = time.ToShortTimeString().Split(":");

                int hour = int.Parse(timePicked[0]);
                int minutes = int.Parse(timePicked[1]);
                Console.WriteLine(timePicked);
                alarmTrigger.Set(Java.Util.Calendar.HourOfDay, hour);
                alarmTrigger.Set(Java.Util.Calendar.Minute, minutes);
                alarmTrigger.Set(Java.Util.Calendar.Second, 0);

                Console.WriteLine(alarmTrigger.Time.ToLocaleString());
                alarmManager.SetInexactRepeating(AlarmType.RtcWakeup, alarmTrigger.TimeInMillis, AlarmManager.IntervalDay * (int)treatment.Frequency, pendingIntent);


                _treatments[position].AlarmTime = time.ToShortTimeString();
                UpdateAlarmTime(_treatments[position]);
                _treatmentsView.Adapter = new TreatmentAdapter(_treatments.ToArray(), this);
            });

            frag.Show(FragmentManager, AlarmPickerFragment.TAG);
        }

        // sets alarmTime property for treatments
        private void UpdateAlarmTime(Treatment treatment)
        {
            var db = _userService.GetDatabase(this);
            IDictionary<string, Java.Lang.Object> mapTreatment = new Dictionary<string,Java.Lang.Object>();
            mapTreatment["alarmTime"] = treatment.AlarmTime;

            db.Collection("Medics").Document(clientLogged.MedicSubscribed.Id).Collection("Clients").Document(clientLogged.Id).Collection("Treatments")
                .Document(treatment.Id).Update(mapTreatment);
        }

        // when user deletes the alarm
        private void DeleteAlarmTime(Treatment treatment)
        {
            var db = _userService.GetDatabase(this);
            IDictionary<string, Java.Lang.Object> mapTreatment = new Dictionary<string, Java.Lang.Object>();
            mapTreatment["alarmTime"] = FieldValue.Delete();

            TaskCompletionListener deleteAlarmListener = new TaskCompletionListener();
            deleteAlarmListener.Succes += DeleteAlarmListener_Succes;
            deleteAlarmListener.Failure += DeleteAlarmListener_Failure;

            db.Collection("Medics").Document(clientLogged.MedicSubscribed.Id).Collection("Clients").Document(clientLogged.Id).Collection("Treatments")
               .Document(treatment.Id).Update(mapTreatment).AddOnSuccessListener(deleteAlarmListener).AddOnFailureListener(deleteAlarmListener);
        }

        private void DeleteAlarmListener_Failure(object sender, EventArgs e)
        {
            var exception = (Java.Lang.Exception)sender;
            Console.WriteLine(exception);
        }

        private void DeleteAlarmListener_Succes(object sender, EventArgs e)
        {
            Console.WriteLine("Sucees!");
        }

        public void CreateNotificationChannel()
        {
            if(Build.VERSION.SdkInt < BuildVersionCodes.Base){
                // Notification channels are new in API 26 (and not a part of the
                // support library). There is no need to create a notification
                // channel on older versions of Android.
                return;
            }
            var channel = new NotificationChannel(CHANNEL_ID, "FCM Notifications", NotificationImportance.Default)
            {
                Description = "Firebase Cloud messages appear in this channel"
            };

            var notificationManager = (NotificationManager)GetSystemService(Android.Content.Context.NotificationService);
            notificationManager.CreateNotificationChannel(channel);
        }

        public override void OnBackPressed()
        {
            DrawerLayout drawer = FindViewById<DrawerLayout>(Resource.Id.drawer_layout);
            if(drawer.IsDrawerOpen(GravityCompat.Start))
            {
                drawer.CloseDrawer(GravityCompat.Start);
            }
            else
            {
                renderSnackBar("Nu puteti merge la autentificare!");
            }
        }

        public override bool OnCreateOptionsMenu(IMenu menu)
        {
            MenuInflater.Inflate(Resource.Menu.menu_main, menu);
            return true;
        }

        public override bool OnOptionsItemSelected(IMenuItem item)
        {
            int id = item.ItemId;
            if (id == Resource.Id.action_settings)
            {
                return true;
            }

            return base.OnOptionsItemSelected(item);
        }

        private void FabOnClick(object sender, EventArgs eventArgs)
        {
            View view = (View) sender;
            Snackbar.Make(view, "Replace with your own action", Snackbar.LengthLong)
                .SetAction("Action", (Android.Views.View.IOnClickListener)null).Show();
        }

        void renderSnackBar(string message)
        {
            var contentMainView = FindViewById<RelativeLayout>(Resource.Id.main_View);
            Snackbar snackbar = Snackbar.Make(contentMainView,message, Snackbar.LengthLong);
            snackbar.Show();
        }

        

        public bool OnNavigationItemSelected(IMenuItem item)
        {
            int id = item.ItemId;

            // get client data that is stored locally
            if (id == Resource.Id.nav_appointments)
            {
                StartActivity(typeof(UpcomingAppointmentsActivity));
            }
            else if (id == Resource.Id.nav_medics)
            {
                StartActivity(typeof(MedicActivity));
            }
            else if (id == Resource.Id.nav_pets)
            {
                
                StartActivity(typeof(PetsActivity));
            }
            else if (id == Resource.Id.nav_pharmacies)
            {
                StartActivity(typeof(NearbyPharmaciesActivity));
            }
            else if (id == Resource.Id.nav_invoice)
            {
                StartActivity(typeof(ClientInvoicesActivity));
            }
            else if (id == Resource.Id.nav_logout)
            {
                // logout user
                var auth = _userService.GetAuth(this);
                auth.SignOut();
                StartActivity(typeof(LogInActivity));
            }

            DrawerLayout drawer = FindViewById<DrawerLayout>(Resource.Id.drawer_layout);
            drawer.CloseDrawer(GravityCompat.Start);
            return true;
        }

      
        public override void OnRequestPermissionsResult(int requestCode, string[] permissions, [GeneratedEnum] Android.Content.PM.Permission[] grantResults)
        {
            Xamarin.Essentials.Platform.OnRequestPermissionsResult(requestCode, permissions, grantResults);

            base.OnRequestPermissionsResult(requestCode, permissions, grantResults);
        }
    }
}

