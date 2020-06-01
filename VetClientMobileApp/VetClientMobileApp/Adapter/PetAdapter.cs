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
    class PetAdapter : BaseAdapter<Animal>
    {
        Animal[] _animals;
        Activity _context;
        public PetAdapter(Animal[] animals,Activity context) : base()
        {
            _animals = animals;
            _context = context;
        }
        public override Animal this[int position] => _animals[position];

        public override int Count => _animals.Count();

        public override long GetItemId(int position)
        {
            return position;
        }

        public override View GetView(int position, View convertView, ViewGroup parent)
        {
            View view = convertView;
            if (view == null)
                view = _context.LayoutInflater.Inflate(Resource.Layout.pet_item, null);
            view.FindViewById<TextView>(Resource.Id.txtNamePet).Text = _animals[position].Name;
            view.FindViewById<TextView>(Resource.Id.txtAgePet).Text = "Varsta: " + _animals[position].Age.ToString();

            return view;
        }
    }
}