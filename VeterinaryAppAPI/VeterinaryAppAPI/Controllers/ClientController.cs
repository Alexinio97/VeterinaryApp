using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Google.Cloud.Firestore;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using VeterinaryAppAPI.Services;

namespace VeterinaryAppAPI.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class ClientController : ControllerBase
    {
        private MedicRepository _medics;
        private IUserService _userService;
        public ClientController(IUserService userService, MedicRepository medics)
        {
            _userService = userService;
            _medics = medics;
        }

        // GET: api/Client
        [HttpGet]
        public IEnumerable<string> Get()
        {
            return new string[] { "value1", "value2" };
        }

        //// GET: api/Client/5
        //[HttpGet("{id}")]
        //public async Task<IActionResult> Get(string clientId)
        //{
        //    var identity = (ClaimsIdentity)User.Identity;
        //    var loggedUserId = identity.Claims.ToList().First().Value;
        //    var animals = await _medics.GetMedicData(clientId);
        //    return Ok(animals);
        //}

        // POST: api/Client
        [HttpPost]
        public void Post([FromBody] string value)
        {
        }

        // PUT: api/Client/5
        [HttpPut("{id}")]
        public void Put(int id, [FromBody] string value)
        {
        }

        // DELETE: api/ApiWithActions/5
        [HttpDelete("{id}")]
        public void Delete(int id)
        {
        }
    }
}
