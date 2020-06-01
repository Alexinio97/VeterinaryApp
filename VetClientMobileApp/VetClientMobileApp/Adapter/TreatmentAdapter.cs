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

namespace VetClientMobileApp.Adapter
{
    class TreatmentAdapter : BaseAdapter<Treatment>
    {
        Treatment[] _treatments;
        Activity _context;
        public TreatmentAdapter(Treatment[] treatments,Activity context)
        {
            _treatments = treatments;
            _context = context;
        }
        public override Treatment this[int position] => _treatments[position];

        public override int Count => _treatments.Count();

        public override long GetItemId(int position)
        {
            return position;
        }

        public override View GetView(int position, View convertView, ViewGroup parent)
        {
            View view = convertView;
            if (view == null)
                view = _context.LayoutInflater.Inflate(Resource.Layout.treatment_item, null);
            var convertedDate = DateTimeOffset.FromUnixTimeMilliseconds(_treatments[position].FinalDate.Time);
            view.FindViewById<TextView>(Resource.Id.txt_dosage).Text = "Dozaj: " + _treatments[position].Dosage.ToString() + " pe zi.";
            view.FindViewById<TextView>(Resource.Id.txt_frequency).Text = "Frecventa(/zi): " + _treatments[position].Frequency.ToString().Replace("_", " ");
            view.FindViewById<TextView>(Resource.Id.txt_finalDate).Text = "Pana la: " + convertedDate.ToString("d");
            view.FindViewById<TextView>(Resource.Id.txt_treatment).Text = "Medicament: " + _treatments[position].Name;
            view.FindViewById<TextView>(Resource.Id.txt_animalName).Text = _treatments[position].AnimalName;
            if(_treatments[position].AlarmTime != null )
                view.FindViewById<TextView>(Resource.Id.txt_alarm).Text = "Alarma setata la: " + _treatments[position].AlarmTime;

            return view;
        }
    }
}