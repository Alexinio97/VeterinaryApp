using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Text;

using Android.App;
using Android.Content;
using Android.Gms.Maps;
using Android.Gms.Maps.Model;
using Android.OS;
using Android.Runtime;
using Android.Support.Design.Widget;
using Android.Views;
using Android.Widget;
using Newtonsoft.Json;
using Org.Json;
using VetClientMobileApp.Models;
using Xamarin.Essentials;

namespace VetClientMobileApp.Activities
{
    [Activity(Label = "NearbyPharmaciesActivity")]
    public class NearbyPharmaciesActivity : Activity,IOnMapReadyCallback
    {
        public async void OnMapReady(GoogleMap googleMap)
        {
            var location = await Geolocation.GetLastKnownLocationAsync();
            if(location != null)
            {
                MarkerOptions markerOptions = new MarkerOptions();
                markerOptions.SetPosition(new LatLng(location.Latitude, location.Longitude));
                markerOptions.SetTitle("Pozitia mea");
                
                markerOptions.SetIcon(BitmapDescriptorFactory.DefaultMarker(BitmapDescriptorFactory.HueBlue));
                googleMap.AddMarker(markerOptions);
                googleMap.UiSettings.ZoomControlsEnabled = true;
                googleMap.MoveCamera(CameraUpdateFactory.NewLatLngZoom(markerOptions.Position,14));
                var places = await GetNearByPlacesAsync(location.Longitude, location.Latitude);

                foreach (var place in places.results)
                {
                    MarkerOptions pharmacy = new MarkerOptions();
                    pharmacy.SetPosition(new LatLng(place.geometry.location.lat, place.geometry.location.lng));
                    pharmacy.SetTitle(place.name);
                    pharmacy.SetSnippet(place.vicinity);
                    googleMap.AddMarker(pharmacy);
                }
            }
        }

        protected override void OnCreate(Bundle savedInstanceState)
        {
            base.OnCreate(savedInstanceState);

            SetContentView(Resource.Layout.pharamcies_main);

            MapFragment mapFragment = (MapFragment)FragmentManager.FindFragmentById(Resource.Id.map);
            mapFragment.GetMapAsync(this);

        }

       
        public async System.Threading.Tasks.Task<RootObject> GetNearByPlacesAsync(double longitude,double latitude)
        {
            StringBuilder sb = new StringBuilder("https://maps.googleapis.com/maps/api/place/nearbysearch/json?");
            CultureInfo In = new CultureInfo("en-US");
            string longitudeS = longitude.ToString(In);
            string latitudeS = latitude.ToString(In);
            sb.Append("location=" + latitudeS + "," + longitudeS);
            sb.Append("&radius=2500");
            sb.Append("&types=veterinary_care");
            sb.Append("&sensor=true");
            sb.Append("&key=AIzaSyAduCbrlu_X6NOrqm80BPItdtGcmZAviYQ");


            WebRequest request = WebRequest.Create(sb.ToString());

            WebResponse response = request.GetResponse();

            Stream data = response.GetResponseStream();

            StreamReader reader = new StreamReader(data);
            // json-formatted string from maps api
            string responseFromServer = reader.ReadToEnd();
            var places = JsonConvert.DeserializeObject<RootObject>(responseFromServer);

            response.Close();

            return places;
        }
    }
}