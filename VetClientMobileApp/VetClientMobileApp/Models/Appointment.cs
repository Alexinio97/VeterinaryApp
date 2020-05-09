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
    class Appointment
    {
        public string Id { get; set; }
        public Java.Util.Date StartTime { get; set; }
        public Java.Util.Date EndTime { get; set; }
        public float Price { get; set; }
        public string Type { get; set; }
        public float Duration { get; set; }
        public string AnimalName { get; set; }
    }
}