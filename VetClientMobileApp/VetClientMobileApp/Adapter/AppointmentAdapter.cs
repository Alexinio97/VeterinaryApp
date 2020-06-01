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
using VetClientMobileApp.Models;
using VetClientMobileApp.Services;
using VetClientMobileApp.Activities;

namespace VetClientMobileApp.Adapter
{
    class AppointmentAdapter : BaseAdapter<Appointment>
    {
        Appointment[] _appointments;
        Activity _context;
        ImageButton deleteBtn;
        public bool _displayUpcomingAppoints;
        private readonly FirebaseFunctionsService _functionsService;
        public AppointmentAdapter(Appointment[] appointments,Activity context,bool displayUpcomingAppoints)
        {
            _appointments = appointments;
            _context = context;
            _displayUpcomingAppoints = displayUpcomingAppoints;
            _functionsService = new FirebaseFunctionsService(context, context);
        }
        public override Appointment this[int position] => _appointments[position];

        public override int Count => _appointments.Count();

        public override long GetItemId(int position)
        {
            return position;
        }

        public override View GetView(int position, View convertView, ViewGroup parent)
        {
            View view = convertView;
            if (_displayUpcomingAppoints)
            {
                
                if (view == null)
                    view = _context.LayoutInflater.Inflate(Resource.Layout.upcoming_appoints_item, null);
                deleteBtn = view.FindViewById<ImageButton>(Resource.Id.delete_appointBtn); // storing button
                view.FindViewById<TextView>(Resource.Id.upcoming_type_appoint).Text = _appointments[position].Type;
                var convertedDate = DateTimeOffset.FromUnixTimeMilliseconds(_appointments[position].StartTime.Time);
                view.FindViewById<TextView>(Resource.Id.txt_PetName).Text = _appointments[position].AnimalName;
                view.FindViewById<TextView>(Resource.Id.upcoming_date_appoint).Text = "Data: " + convertedDate.ToString("d");
                view.FindViewById<TextView>(Resource.Id.upcoming_price_appoint).Text = "Pret: " + _appointments[position].Price.ToString();
                view.FindViewById<TextView>(Resource.Id.upcoming_duration_appoint).Text = "Durata: " + _appointments[position].Duration.ToString() + " min";
                Java.Lang.Object animalName = _appointments[position].Id;
                deleteBtn.SetTag(deleteBtn.Id, animalName);
                deleteBtn.Click += AppointmentAdapter_Click;
            }
            else
            {
                if (view == null)
                    view = _context.LayoutInflater.Inflate(Resource.Layout.appointment_history_item, null);
                view.FindViewById<TextView>(Resource.Id.type_appoint).Text = _appointments[position].Type;
                var convertedDate = DateTimeOffset.FromUnixTimeMilliseconds(_appointments[position].StartTime.Time);
                view.FindViewById<TextView>(Resource.Id.date_appoint).Text = "Data: " + convertedDate.ToString("d");
                view.FindViewById<TextView>(Resource.Id.price_appoint).Text = "Pret: " + _appointments[position].Price.ToString();
                view.FindViewById<TextView>(Resource.Id.duration_appoint).Text = "Durata: " + _appointments[position].Duration.ToString() + " min";
            }
            return view;
        }

        private void AppointmentAdapter_Click(object sender, EventArgs e)
        {
            // get services;
            UserService userService = new UserService();
            var firestoreDb = userService.GetDatabase(_context);
            // get local storage service
           
            View receivedView = (View)sender;
            var appoitnId = receivedView.GetTag(deleteBtn.Id);
            Console.WriteLine("Button clicked.");
            

            var deleteAppointAlert = new AlertDialog.Builder(_context);
            deleteAppointAlert.SetTitle("Sterge programare");
            deleteAppointAlert.SetMessage($"Sunteti sigur ca doriti sa stergeti aceasta programare?");
            deleteAppointAlert.SetPositiveButton("Da", async delegate {
                StorageService storage = new StorageService();
                var clientLogged = await storage.GetClientDataLocal();
                firestoreDb.Collection("Medics").Document(clientLogged.MedicSubscribed.Id).Collection("Appointments").Document(appoitnId.ToString())
                .Delete();
                // delete appointment also from list
                List<Appointment> appointsList = _appointments.ToList<Appointment>();
                var appointToDelete = appointsList.FirstOrDefault(appoint => appoint.Id.Equals(appoitnId.ToString()));
                appointsList.Remove(appointToDelete);

                //send notification that appointment was deleted
                Models.Notification newNotif = new Models.Notification()
                {
                    Description = $"Programarea a fost anulata de catre {clientLogged.FirstName}, {clientLogged.LastName}." ,
                    Type = "Programare anulata",
                    Timestamp = DateTime.Now.ToLocalTime(),
                    MedicId = clientLogged.MedicSubscribed.Id,
                };

                await _functionsService.AddNotification(newNotif, "notificationCreate");

                _appointments = appointsList.ToArray();
                deleteAppointAlert.Dispose();
                _context.Finish();
                _context.StartActivity(typeof(UpcomingAppointmentsActivity));
                return;
            });
            deleteAppointAlert.SetNegativeButton("Nu", delegate
            {
                deleteAppointAlert.Dispose();
            });
            deleteAppointAlert.Show();
        }
    }
}