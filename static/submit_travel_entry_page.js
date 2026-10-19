// form validation https://www.w3schools.com/js/js_validation.asp

// form validation, if the fields are empty, alert will say that the fields is empty and form wont submit
function validateForm() {
  let x = document.forms["entry_form"]
  
  if (x["date"].value == "") {
    alert("Date must be filled out");
    return false;
  }
  
  if (x["leg_1"].value == "") {
    alert("Leg 1 must be filled out");
    return false;
  }
  
  if (x["leg_2"].value == "") {
    alert("Leg 2 must be filled out");
    return false;
  }
  
  if (x["single_return"].value == "") {
    alert("Single or return must be filled out");
    return false;
  }
  
  if (x["class"].value == "") {
    alert("Class must be filled out");
    return false;
  }
  
  if (x["mode_of_transport"].value == "") {
    alert("Mode of transport must be filled out");
    return false;
  }
  
  if (x["total_miles"].value == "") {
    alert("Total miles must be filled out");
    return false;
  }
  
  if (x["co2"].value == "") {
    alert("CO2 Produced miles must be filled out");
    return false;
  }
  }


// https://youtu.be/TTf0mMl0Sc4?si=mcZuekR_aTP2ZcXK
// https://nocodeform.io/docs/forms/submit-form-with-fetch
// https://developer.mozilla.org/en-US/docs/Web/API/HTMLFormElement/reset
// https://www.w3schools.com/jsref/event_target.asp

// ARIAN CODE INSIDE ANAS CODE START//

function calculateMiles() {
  const leg1 = document.getElementById("leg_1").value;
  const leg2 = document.getElementById("leg_2").value;

  if (!leg1 || !leg2) return; // do nothing if empty

  fetch("/calculate_miles", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ leg_1: leg1, leg_2: leg2 })
  })
  .then(res => res.json())
  .then(data => {
    // store base miles returned from API
    const baseMiles = data.miles;
    document.getElementById("total_miles").dataset.baseMiles = baseMiles; // save in data attribute
    document.getElementById("co2").dataset.baseMiles = baseMiles;

    updateMilesAndCO2(); // initial update
  })
  .catch(err => console.error(err));
}

// function to adjust miles and CO2 based on single/return
function updateMilesAndCO2() {
  const singleReturn = document.getElementById("single_return").value;
  const totalMilesInput = document.getElementById("total_miles");
  const co2Input = document.getElementById("co2");
  let miles = parseFloat(totalMilesInput.dataset.baseMiles || 0);

  if (!miles) return;

  if (singleReturn === "return") {
  miles = (miles * 2).toFixed(2); // 
} else {
  miles = miles.toFixed(2);
}

  totalMilesInput.value = miles;

  // CO2 calculation
  const co2 = (miles * 0.000257).toFixed(3);
  co2Input.value = co2;
}

// attach listener for single/return changes
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("single_return").addEventListener("change", updateMilesAndCO2);
});

// ARIAN CODE INSIDE ANAS CODE END //




document.addEventListener("DOMContentLoaded", () => { //wait till DOM content is loaded
  const form = document.getElementById("entry_form"); // create variable that gets the entry form

// when submit is pressed, run the function formsubmit
  form.addEventListener("submit", formSubmit);
});
// function for fetch
function formSubmit(e) {
  e.preventDefault() // prevents refresh/default submission

  if (validateForm() === false) {
    return; // calling validation to stop submit if empty
  }

  const form = e.target; 
  const formData = new FormData(form); // replace the empty form data with new filled form data

  // run the route to submit and entry
  fetch("/submit_an_entry",
  {
    method: "POST",
    body: formData,
  })
  .then(response => {
    console.log(response) // put server response in the console
    document.getElementById("message").textContent = "Record successfully added"; // adding success message to empty div
  })

  .catch(error => console.log(error)) // catch any errors and put into console
  form.reset(); // reset form after submission
}


// Code for the autocomplete feature https://www.youtube.com/watch?v=1iysNUrI3lw&t=362s
document.addEventListener('DOMContentLoaded', () => { // doesnt work without loading the DOM


  // Function to setup autocomplete for any input + dropdown
  const setupAutocomplete = (inputElement, resultBox) => {

      // Search through airports.json for airports
    const search_airports = async searchText => {
      const res = await fetch('/static/airports.json');
      const airports = await res.json(); 
      const airportsArray = Object.values(airports); // JSON file was an object not an array

      // match the search to the JSON file and filter
      let matches = airportsArray.filter(airport => {
        const regex = new RegExp(`^${searchText}`, 'gi');
        return airport.city.match(regex) || airport.iata.match(regex);
      });


      // if search is emtpy, return no results
      if (searchText.length === 0) {
        matches = [];
        resultBox.innerHTML = '';
      }

      outputHtml(matches);
    };

    const outputHtml = matches => {
      if (matches.length > 0) {
        const html = matches
          .map(
            match => `
            <div class="card card-body mb-1 airport-option" 
                 data-value="${match.city} (${match.iata})">
              <p>${match.city} (${match.iata})</p>
            </div>
          `
          )
          .join('');

        resultBox.innerHTML = html;

        // Add click listeners to each option to put selected option into field
        const options = resultBox.querySelectorAll('.airport-option');
        options.forEach(option => {
          option.addEventListener('click', () => {
            inputElement.value = option.getAttribute('data-value');
            resultBox.innerHTML = '';
          });
        });
      }
    };

    inputElement.addEventListener('input', () => search_airports(inputElement.value));
  };

  // Apply autocomplete to all legs with 1 more line of code
  setupAutocomplete(document.getElementById('leg_1'), document.getElementById('airport_auto'));
  setupAutocomplete(document.getElementById('leg_2'), document.getElementById('airport_auto_2'));

});

// -------------------- YASINS EDIT STARTS HERE ----------------------
// -------------------- DYNAMIC EXTRA LEGS + AUTOCOMPLETE ----------------------
document.addEventListener('DOMContentLoaded', () => {

    const addLegBtn = document.getElementById('add-leg-btn');
    const extraLegsContainer = document.getElementById('extra-legs-container');
    const extraLegs = Array.from(extraLegsContainer.querySelectorAll('.col'));
    let nextLegIndex = 0;

    // Function to setup autocomplete for any input + result box
    const setupAutocomplete = (inputElement, resultBox) => {
        const search_airports = async searchText => {
            const res = await fetch('/static/airports.json');
            const airports = await res.json();
            const airportsArray = Object.values(airports);

            let matches = airportsArray.filter(airport => {
                const regex = new RegExp(`^${searchText}`, 'gi');
                return airport.city.match(regex) || airport.iata.match(regex);
            });

            if (searchText.length === 0) matches = [];
            outputHtml(matches);
        };

        const outputHtml = matches => {
            if (matches.length > 0) {
                const html = matches.map(match => `
                    <div class="card card-body mb-1 airport-option" data-value="${match.city} (${match.iata})">
                        <p>${match.city} (${match.iata})</p>
                    </div>
                `).join('');

                resultBox.innerHTML = html;

                const options = resultBox.querySelectorAll('.airport-option');
                options.forEach(option => {
                    option.addEventListener('click', () => {
                        inputElement.value = option.getAttribute('data-value');
                        resultBox.innerHTML = '';
                    });
                });
            } else {
                resultBox.innerHTML = '';
            }
        };

        inputElement.addEventListener('input', () => search_airports(inputElement.value));
    };

    // Show next hidden leg on button click
    addLegBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (nextLegIndex < extraLegs.length) {
            const legCol = extraLegs[nextLegIndex];
            legCol.style.display = 'block';

            // Attach autocomplete to the newly shown leg
            const input = legCol.querySelector('input');
            const resultBox = legCol.querySelector('.autocomplete-box');
            setupAutocomplete(input, resultBox);

            nextLegIndex++;
        }
        if (nextLegIndex >= extraLegs.length) {
            addLegBtn.disabled = true;
        }
    });

   
});


// -------------------- YASINS EDIT ENDS HERE ----------------------
