using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using VeterinaryAppAPI.DataAcces;
using VeterinaryAppAPI.Services;

namespace VeterinaryAppAPI.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class AnimalController : ControllerBase
    {

        private readonly AnimalRepository _animalsRepo;
        private readonly IUserService _userService;
        public AnimalController(AnimalRepository animalRepo,IUserService userService)
        {
            _animalsRepo = animalRepo;
            _userService = userService;
        }
        
        // GET: api/Animal 
        [HttpGet]
        public IEnumerable<string> Get()
        { 
            // this will return all animals
            return new string[] { "value1", "value2" };
        }

        [HttpGet("{id}/Animals")]
        public async Task<IActionResult> GetAnimals(string id)
        {
            var identity = (ClaimsIdentity)User.Identity;
            var loggedUserId = identity.Claims.ToList().First().Value;
            var animals = await _animalsRepo.GetUserAnimals(id, loggedUserId);
            return Ok(animals);
        }

        // GET: api/Animal/5
        [HttpGet("{id}")]
        public async Task<IActionResult> Get(string animalId)
        {
            var animal = await _animalsRepo.GetAnimal(animalId);
            return Ok(animal);
        }

        // POST: api/Animal
        [HttpPost]
        public void Post([FromBody] string value)
        {
        }

        // PUT: api/Animal/5
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
