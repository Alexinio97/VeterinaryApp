using System;
using System.Collections.Generic;
using System.Text;

namespace VetClientMobileApp.Models
{
    public enum MenuItemType
    {
        Medics,
        Appointments,
        Profile,
        Animals
    }
    class HomeMenuItem
    {
        public MenuItemType Id { get; set; }
        public string Title { get; set; }
        public string Icon { get; set; }
    }
}
