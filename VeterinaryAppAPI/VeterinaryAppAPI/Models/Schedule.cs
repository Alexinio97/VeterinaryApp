using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Google.Cloud.Firestore;

namespace VeterinaryAppAPI
{
    [FirestoreData]
    public class Schedule
    {
        [FirestoreProperty]
        public string CheckIn { get; set; }
        [FirestoreProperty]
        public string CheckOut { get; set; }
    }
}
