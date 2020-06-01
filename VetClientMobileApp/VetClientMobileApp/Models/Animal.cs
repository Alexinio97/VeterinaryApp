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

    public enum Species
    {
        caine,
        pisica
    }
    public enum Neutered
    {
        da,
        nu
    }

    public class Animal
    {
        public string Id { get; set; }
        public int Age { get; set; }
        public string Name { get; set; }
        public string Breed { get; set; }
        public Species Species { get; set; }
        public Neutered Neutered { get; set; }
        public string Photo { get; set; }
    }
}