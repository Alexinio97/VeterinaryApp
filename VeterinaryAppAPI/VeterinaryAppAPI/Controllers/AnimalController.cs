using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
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
        [HttpPost("{clientId}")]
        public IActionResult Post(string clientId,[FromBody] Animal animal)
        {
            try
            {
                var identity = (ClaimsIdentity)User.Identity;
                var loggedUserId = identity.Claims.ToList().First().Value;
                _animalsRepo.AddAnimal(animal,loggedUserId,clientId);
                return Ok();
            }
            catch (Exception ex)
            {
                Console.WriteLine("Exception caught: " + ex.ToString());
                return BadRequest(ex.ToString());
            }
        }

        // Update method
        //Adding an animal to a client
        // PUT: api/Animal/5
        [HttpPut("{clientId}")]
        public IActionResult Put(string clientId,[FromBody] Animal animal)
        {
            try
            {
                var identity = (ClaimsIdentity)User.Identity;
                var loggedUserId = identity.Claims.ToList().First().Value;
                _animalsRepo.UpdateAnimal(animal,loggedUserId,clientId);
                return Ok();
            }
            catch(Exception ex)
            {
                Console.WriteLine("Exception caught: " + ex.ToString());
                return BadRequest(ex.ToString());
            }
            
        }

        // DELETE: api/ApiWithActions/5
        [HttpDelete("{clientId}/{animalId}")]
        public async Task<IActionResult> DeleteAsync(string clientId,string animalId)
        {
            try
            {
                var identity = (ClaimsIdentity)User.Identity;
                var loggedUserId = identity.Claims.ToList().First().Value;
                await _animalsRepo.DeleteAnimalAsync(animalId, loggedUserId, clientId);
                return Ok();
            }
            catch(Exception ex)
            {
                return BadRequest(ex.ToString());
            }
        }
    }
}
