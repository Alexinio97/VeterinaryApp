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

namespace VetClientMobileApp.Models
{
    class AppointmentCategory
    {
        public string Id { get; set; }
        public string Type { get; set; }
        public float Duration { get; set; }
        public int Price { get; set; }
    }
}