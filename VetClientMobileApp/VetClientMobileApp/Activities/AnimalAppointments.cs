using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using Android.App;
using Android.Content;
using Android.Gms.Tasks;
using Android.Graphics;
using Android.OS;
using Android.Runtime;
using Android.Views;
using Android.Widget;
using Com.Syncfusion.Schedule;
using Com.Syncfusion.Schedule.Enums;
using Firebase.Firestore;
using Java.Util;
using Newtonsoft.Json;
using VetClientMobileApp.EventListeners;
using VetClientMobileApp.Models;
using VetClientMobileApp.Services;

namespace VetClientMobileApp.Activities
{
    [Activity(Label = "AnimalAppointments")]
    public class AnimalAppointments : Activity
    {
        private readonly StorageService _storageService;
        private Animal animalSelected;
        private FirebaseFirestore _firestoreDb;
        private readonly IUserService _userService;
        private AppointmentCategory _consultType;
        private Client clientLogged;
        private ScheduleAppointmentCollection _appointments;
        private SfSchedule _scheduler;

        public AnimalAppointments()
        {
            _storageService = new StorageService();
            _userService = new UserService();
            _consultType = new AppointmentCategory();
        }
        protected override async void OnCreate(Bundle savedInstanceState)
        {
            base.OnCreate(savedInstanceState);

            //get Database
            _firestoreDb = _userService.GetDatabase(this);
            clientLogged = await  _storageService.GetClientDataLocal();
            await GetConsultCategory();
            animalSelected = JsonConvert.DeserializeObject<Animal>(Intent.GetStringExtra("Animal"));
            
            SetContentView(Resource.Layout.pet_appointments_main);
            _scheduler = FindViewById<SfSchedule>(Resource.Id.appointments_scheduler);
            FetchAppointmentsWeek();
                  
            var scheduleHours = GetMedicScheduleHours();

            _scheduler.ScheduleView = ScheduleView.WeekView;
            
            WeekViewSettings settings = new WeekViewSettings();
            settings.WeekLabelSettings.TimeFormat = "hh:mm";
            settings.StartHour = scheduleHours[0];
            settings.EndHour = scheduleHours[1];

            // set medic working hours interval
            _scheduler.WeekViewSettings = settings;
            _scheduler.CellTapped += Scheduler_CellTapped;            
        }

        public async System.Threading.Tasks.Task PopulateAppointments()
        {
            while(_appointments.Count == 0)
            {
                await System.Threading.Tasks.Task.Delay(500);
            }
        }

        private void FetchAppointmentsWeek()
        {
            TaskCompletionListener appointmentsListener = new TaskCompletionListener();
            appointmentsListener.Succes += AppointmentsListener_Succes;
            appointmentsListener.Failure += AppointmentsListener_Failure;

            _firestoreDb.Collection("Medics").Document(clientLogged.MedicSubscribed.Id).Collection("Appointments")
                .WhereGreaterThan("startTime", new Date())
                .Get().AddOnSuccessListener(appointmentsListener)
                .AddOnFailureListener(appointmentsListener);
        }

        private void AppointmentsListener_Failure(object sender, EventArgs e)
        {
            var exception = (Java.Lang.Exception)sender;
            Console.WriteLine("Exception caught: ",sender.ToString());
        }

        private void AppointmentsListener_Succes(object sender, EventArgs e)
        {
            var snapshot = (QuerySnapshot)sender;
            _appointments = new ScheduleAppointmentCollection();
            if (!snapshot.IsEmpty)
            {
                var documents = snapshot.Documents;
                try
                {
                    foreach (var document in documents)
                    {
                        var newAppointment = new ScheduleAppointment();

                        Calendar startTimeCalendar = Calendar.Instance;
                        Calendar endTimeCalendar = Calendar.Instance;
                        startTimeCalendar.TimeInMillis = document.GetDate("startTime").Time;
                        // set start time of appointment and ending of it
                        endTimeCalendar.TimeInMillis = document.GetDate("endTime").Time;



                        newAppointment.StartTime = startTimeCalendar;
                        newAppointment.EndTime = endTimeCalendar;
                        newAppointment.Subject = document.Get("type").ToString();
                        newAppointment.Notes = "Duration: " + document.Get("duration").ToString();
                        newAppointment.Location = "Daily vet";
                        
                        _appointments.Add(newAppointment);
                    }
                    _scheduler.ItemsSource = _appointments;
                }
                catch(Exception ex)
                {
                    Console.WriteLine("Error caught: ", ex.Message);
                    Toast.MakeText(this, "Error getting appointments!", ToastLength.Long);
                }
            }
        }

        private void Scheduler_CellTapped(object sender, CellTappedEventArgs e)
        {
            DateTimeOffset startDate = DateTimeOffset.FromUnixTimeMilliseconds(e.Calendar.Time.Time);
            double difference = (double)e.Calendar.Time.Hours - (double)startDate.Hour;
            // dates are inmutable object so we most create another one
            DateTimeOffset startDateConverted = startDate.AddHours(difference);
            
            if (startDateConverted < DateTime.Now)
            {
                var oldDaySlot = new AlertDialog.Builder(this);
                oldDaySlot.SetTitle("Not allowed.");
                oldDaySlot.SetMessage("Can't make appointments in the past days!");
                oldDaySlot.SetNeutralButton("Ok", delegate
                {
                    oldDaySlot.Dispose();
                });
                oldDaySlot.Show();
                return;
            }
            if (e.ScheduleAppointment != null || e.ScheduleAppointments != null)
            {
                var slotTakenAlert = new AlertDialog.Builder(this);
                slotTakenAlert.SetTitle("Not allowed.");
                slotTakenAlert.SetMessage("This time slot is occupied.");
                slotTakenAlert.SetNeutralButton("Ok", delegate
                 {
                     slotTakenAlert.Dispose();
                 });
                slotTakenAlert.Show();
            }
            else { 
                var startTime = e.Calendar.Time;
                var endTime = e.Calendar.Time;
                endTime.Minutes += (int)_consultType.Duration;
                var makeAppointmentAlert = new AlertDialog.Builder(this);
                makeAppointmentAlert.SetTitle("Appointment at " + startDateConverted.ToString("hh-mm tt",System.Globalization.CultureInfo.InvariantCulture));
                makeAppointmentAlert.SetMessage($"Make appointment for {animalSelected.Name}?");
                makeAppointmentAlert.SetPositiveButton("Yes",delegate  {
                    HashMap mapAppointment = new HashMap();
                    // construct new appointment
                    mapAppointment.Put("animalName",animalSelected.Name);
                    mapAppointment.Put("clientId",clientLogged.Id);
                    mapAppointment.Put("duration", _consultType.Duration);
                    mapAppointment.Put("price", _consultType.Price);
                    mapAppointment.Put("type", _consultType.Type);
                    mapAppointment.Put("startTime", startTime);
                    mapAppointment.Put("endTime", endTime);

                    _firestoreDb.Collection("Medics").Document(clientLogged.MedicSubscribed.Id).Collection("Appointments").Document().Set(mapAppointment);
                    _scheduler.ItemsSource = null;
                    _appointments.Clear();
                    FetchAppointmentsWeek();
                    makeAppointmentAlert.Dispose();
                });
                makeAppointmentAlert.SetNegativeButton("No", delegate
                {
                    makeAppointmentAlert.Dispose();
                });
                makeAppointmentAlert.Show();
            }
        }

        public async System.Threading.Tasks.Task GetConsultCategory()
        {
            try
            {
                TaskCompletionListener taskCompletionListener = new TaskCompletionListener();
                taskCompletionListener.Succes += TaskCompletionListener_Succes; ;
                taskCompletionListener.Failure += TaskCompletionListener_Failure;
                var clientLogged = await _storageService.GetClientDataLocal();
                // add on success listener
                _firestoreDb.Collection("Medics").Document(clientLogged.MedicSubscribed.Id).Collection("AppointmentTypes").Get()
                        .AddOnSuccessListener(taskCompletionListener)
                        .AddOnFailureListener(taskCompletionListener);
            }
            catch (System.Exception ex)
            {
                Console.WriteLine("Error fetching medics:", ex.Message);
                Toast.MakeText(this, "Error fetching medics!", ToastLength.Long);
            }
        }

        private void TaskCompletionListener_Succes(object sender, EventArgs e)
        {
            var snapshot = (QuerySnapshot)sender;

            if (!snapshot.IsEmpty)
            {
                var documents = snapshot.Documents;

                foreach (var document in documents)
                {
                    if(document.Get("type").ToString().Equals("Consult"))
                    { 
                        
                        _consultType.Id = document.Id;
                        _consultType.Duration = float.Parse(document.Get("duration").ToString());
                        _consultType.Price = int.Parse(document.Get("price").ToString());
                        _consultType.Type = document.Get("type").ToString();

                    }
                }
            }
            else
            {
                // if no appointment types exists add the default one
                _consultType.Duration = 15;
                _consultType.Price = 10;
                _consultType.Type = "Consult";

            }

            if(_consultType.Type == null)
            {
                // if no consult has been set  a default one shall be initialized
                _consultType.Duration = 15;
                _consultType.Price = 10;
                _consultType.Type = "Consult";
            }
        }

        private void TaskCompletionListener_Failure(object sender, EventArgs e)
        {
            var result = sender;
            var result2 = e;
        }


        public double[] GetMedicScheduleHours()
        {
            // TODO: get medic schedule from database
            double[] scheduleHours = new double[2];

            double startHour = double.Parse(clientLogged.MedicSubscribed.Schedule["start"].Replace(":", ","));
            double endHour = double.Parse(clientLogged.MedicSubscribed.Schedule["end"].Replace(":", ","));
            if (Math.Round(startHour % 1, 1) == 0.3)
                startHour += 0.2;
            if (Math.Round(endHour % 1, 1) == 0.3)
                endHour += 0.2;

            if (Math.Round(startHour % 1, 1) == 0.5 && Math.Round(endHour % 1, 1) == 0.5)
            {
                scheduleHours[0] = startHour;
                scheduleHours[1] = endHour;
            }
            else
            {
                scheduleHours[0] = Math.Round(startHour);
                scheduleHours[1] = Math.Round(endHour);
            }
            return scheduleHours;
        }
    }
}