using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Text;

using Android.App;
using Android.Content;
using Android.OS;
using Android.Runtime;
using Android.Views;
using Android.Widget;
using Newtonsoft.Json;
using Org.Json;
using Java.Util;

namespace VetClientMobileApp.Models
{
    // this classes are used in order to store information about locations
    public class Location
    {
        public double lat { get; set; }
        public double lng { get; set; }

    }
    public class Northeast
    {
        public double lat { get; set; }
        public double lng { get; set; }

    }
    public class Southwest
    {
        public double lat { get; set; }
        public double lng { get; set; }

    }
    public class Viewport
    {
        public Northeast northeast { get; set; }
        public Southwest southwest { get; set; }

    }
    public class Geometry
    {
        public Location location { get; set; }
        public Viewport viewport { get; set; }

    }
    public class Opening_hours
    {
        public bool open_now { get; set; }

    }
    public class Plus_code
    {
        public string compound_code { get; set; }
        public string global_code { get; set; }

    }
    public class Results
    {
        public string business_status { get; set; }
        public Geometry geometry { get; set; }
        public string icon { get; set; }
        public string id { get; set; }
        public string name { get; set; }
        public Opening_hours opening_hours { get; set; }
        public string place_id { get; set; }
        public Plus_code plus_code { get; set; }
        public double rating { get; set; }
        public string reference { get; set; }
        public string scope { get; set; }
        public IList<string> types { get; set; }
        public int user_ratings_total { get; set; }
        public string vicinity { get; set; }

    }
    public class RootObject
    {
        public IList<string> html_attributions { get; set; }
        public IList<Results> results { get; set; }
        public string status { get; set; }

    }
}