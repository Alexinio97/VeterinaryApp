using System;
using System.Collections.Generic;
using System.Text;

namespace VetClientMobileApp.Models
{
    class Medic
    {
        public string Id { get; set; }
        public string Email { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Phone { get; set; }
        public string Photo { get; set; }
        public Dictionary<string,string> Schedule { get; set; }
    }
}
