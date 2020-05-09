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
    class MedicAdapter : BaseAdapter<Medic>
    {
        Medic[] _medics;
        Activity _context;
        public MedicAdapter(Activity context, Medic[] medics) : base()
        {
            _medics = medics;
            _context = context;
        }
        public override Medic this[int position] => _medics[position];

        public override int Count {
            get { return _medics.Length; }
        }

        
        public override long GetItemId(int position)
        {
            return position;
        }

        public override View GetView(int position, View convertView, ViewGroup parent)
        {
            View view = convertView;
            if (view == null)
                view = _context.LayoutInflater.Inflate(Resource.Layout.medic_item_view, null);
            view.FindViewById<TextView>(Resource.Id.Text1).Text = _medics[position].FirstName + ", " + _medics[position].LastName;
            view.FindViewById<TextView>(Resource.Id.Text2).Text = _medics[position].Phone;
           
            return view;
        }
    }
}