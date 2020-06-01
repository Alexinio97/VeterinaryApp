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

    public enum Frequency
    {
        zilnic=1,
        o_data_la_2_zile=2,
        o_data_la_3_zile=3,
        o_data_la_4_zile=4,
        saptamanal=7,
        lunar=31
    }

    class Treatment
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public Java.Util.Date FinalDate { get; set; }
        public int Dosage { get; set; }
        public Frequency Frequency { get; set; }
        public string AnimalName { get; set; }
        public string AlarmTime { get; set; }
    }
}