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
    class Notification
    {
        public string Id { get; set; }
        public string  Description { get; set; }
        public string Type { get; set; }
        public DateTime Timestamp { get; set; }
        public string MedicId { get; set; }
    }
}