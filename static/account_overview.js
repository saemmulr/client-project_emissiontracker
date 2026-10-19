// ----------- GETTING THE DATA FROM FLASK --------- //






fetch('/get_entries') // AJAX with the GET method
   .then(response => {
       return response.json(); // make flasks response into JS


   })
   .then(data => {
      
       currentEntries = data;
       calculateMetrics(data); //calculations
       fillTable(data); // fill the table
   })


   .catch(error => {
       console.log('Error getting data:', error);
   });






// ----------- 4 METRIC BOX CALCULATIONS ----------- //


function calculateMetrics(entries) {


   // Box 1 : Total Entries
   // how many entries are inside the array
   let totalEntries = entries.length;




   // Box 2 : Total Miles
   // Sum of Miles from the entries
   let totalMiles = 0;
   for (let i = 0; i < entries.length; i++) {
       let miles = parseFloat(entries[i].total_miles) // converting the miles ito number
       totalMiles = totalMiles + miles; // to keep on adding
   }




   // Box 3 : Total Carbon Dioxide
   // add all of them


   let totalCO2 = 0;
   for (let i = 0; i < entries.length; i++) {
       let co2 = parseFloat(entries[i].co2);  // Get CO2 & convert to number
       totalCO2 = totalCO2 + co2;


   }




   // Box 4 : Average CO2 per mile


   let avgCO2PerMile = totalCO2 / totalMiles;


   // now update all the html metric boxes
   updateBoxes(totalEntries,totalMiles,totalCO2,avgCO2PerMile);
}








// -------------- PUT THE NUMBERS INSIDE THE BOXES/CARDS -------------- //


function updateBoxes(entries, miles, co2, avg) {
   let boxes = document.querySelectorAll('.metric-value');


   boxes[0].textContent = entries; // change box 1 into real num
   boxes[1].textContent = miles.toFixed(2); // box 2 into real num
   boxes[2].textContent = co2.toFixed(3) + ' tons'; // updated version to keep metric consistency
   boxes[3].textContent = avg.toFixed(4) + ' tons'; // updated version to keep metric consistency


}












// -------------- Function to add the table with the correct entries -------------- //


function fillTable(entries) {
   const tbody = document.getElementById("entries-tbody");
   tbody.innerHTML = ""; // clear table


   for (let i = 0; i < entries.length; i++) {
       let entry = entries[i];


       let row = document.createElement('tr');
       row.innerHTML = `
           <td>${i + 1}</td>
           <td>${entry.date}</td>
           <td>${entry.name}</td>
           <td>${entry.leg_1}</td>
           <td>${entry.leg_2 || '-'}</td>
           <td>${entry.extra_legs || '-'}</td>        <!-- NEW COLUMN HERE -->
           <td>${entry.single_return}</td>
           <td>${entry.class}</td>
           <td>${entry.mode_of_transport || '-'}</td>
           <td>${entry.total_miles}</td>
           <td>${parseFloat(entry.co2).toFixed(3)} tons</td>
           <td>
               <button class="btn btn-primary btn-sm" onclick="editEntry(${entry.entry_id})">
                   Edit
               </button>
               <button class="btn btn-danger btn-sm" onclick="deleteEntry(${entry.entry_id})">
                   Delete
               </button>
           </td>
       `;
       tbody.appendChild(row);
   }
}


function deleteEntry(entryId) {
   if (!confirm("Are you sure you want to delete this entry? This cannot be undone.")) {
       return;
   }


   fetch("/delete_entry", {
       method: "POST",
       headers: { "Content-Type": "application/json" },
       body: JSON.stringify({ entry_id: entryId })
   })
   .then(response => response.json())
   .then(data => {
       if (data.success) {
           alert("Entry deleted successfully.");
           location.reload(); // reload to refresh table
       } else {
           alert("Failed to delete entry: " + (data.error || ""));
       }
   })
   .catch(error => {
       console.error("Error deleting entry:", error);
       alert("An error occurred while deleting the entry.");
   });
}










// Yasin edits starts here


   // --------- SEARCH FUNCTIONALITY ---------
   document.addEventListener('DOMContentLoaded', () => {


       const searchInput = document.querySelector('.search-bar');


       if (!searchInput) return;


       searchInput.addEventListener('input', () => {
           const query = searchInput.value.toLowerCase();


           document.querySelectorAll('#entries-tbody tr').forEach(row => {
               const rowText = row.innerText.toLowerCase();
               row.style.display = rowText.includes(query) ? "" : "none";
           });
       });


   });


   // -------------- Filter activation --------------
   document.addEventListener('DOMContentLoaded', () => {
       // All buttons inside the dropdown automatically call applyFilter()
       const filterButtons = document.querySelectorAll('#filter-dropdown button');


       filterButtons.forEach(btn => {
           btn.addEventListener('click', () => {
           });
       });
   });




// Yasin edits end here.


// -------------- EDIT ENTRY MODAL ARIAN WORK -------------- //


// ----------- GETTING THE DATA FROM FLASK --------- //
let currentEntries = [];


window.editEntry = function(id) {
   let entry = currentEntries.find(e => e.entry_id === id);


   document.getElementById("editEntryId").value = entry.entry_id;
   document.getElementById("editDate").value = entry.date;
   document.getElementById("editLeg1").value = entry.leg_1;
   document.getElementById("editLeg2").value = entry.leg_2;
   document.getElementById("editSingleReturn").value = entry.single_return;
   document.getElementById("editTransport").value = entry.mode_of_transport;
   document.getElementById("editClass").value = entry.class;
   document.getElementById("editMiles").value = entry.total_miles;
   document.getElementById("editCO2").value = entry.co2;


   const modal = new bootstrap.Modal(document.getElementById('editModal'));
   modal.show();
}


// -------------- SAVE EDIT AND SENT TO DATABASE WHEN CHANGED -------------- //
function saveEdit() {
   let updated = {
       entry_id: parseInt(document.getElementById("editEntryId").value),
       date: document.getElementById("editDate").value,
       leg_1: document.getElementById("editLeg1").value,
       leg_2: document.getElementById("editLeg2").value,
       single_return: document.getElementById("editSingleReturn").value,
       mode_of_transport: document.getElementById("editTransport").value,
       class: document.getElementById("editClass").value,
       total_miles: parseFloat(document.getElementById("editMiles").value),
       co2: parseFloat(document.getElementById("editCO2").value)
   };


   fetch('/update_entry', {
       method: "POST",
       headers: { "Content-Type": "application/json" },
       body: JSON.stringify(updated)
   })
   .then(res => res.json())
    .then(response => {
       if (response.success) {
           location.reload(); // refresh table
       } else {
           // ✅ CHANGED: show error details if update fails
           alert("Update failed: " + (response.error || "unknown error"));
       }
   })
   // ✅ CHANGED: catch fetch/network errors
   .catch(error => {
       console.log("Fetch error:", error);
       alert("Failed to save changes.");
   });
}








// --------------- THE CSV JS STUFF HERE ----------------- //




document.addEventListener('DOMContentLoaded', function() {
  
   const csvBtn = document.getElementById('csvDownloadBtn');
  
   if (csvBtn) {
       csvBtn.addEventListener('click', function() {
           // Show a loading state
           const originalText = this.innerHTML;
           this.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Downloading...';
           this.disabled = true;
          
           // Fetch the CSV from Flask
           fetch('/download_csv')
               .then(response => {
                   if (!response.ok) {
                       throw new Error('Download failed');
                   }
                   return response.blob();
               })
               .then(blob => {
                   // Create a temporary download link
                   const url = window.URL.createObjectURL(blob);
                   const a = document.createElement('a');
                   a.href = url;
                   a.download = 'emission_data_' + new Date().toISOString().split('T')[0] + '.csv';
                   document.body.appendChild(a);
                   a.click();
                  
                   // Cleanup
                   window.URL.revokeObjectURL(url);
                   document.body.removeChild(a);
                  
                   // Reset button
                   this.innerHTML = originalText;
                   this.disabled = false;
               })
               .catch(error => {
                   console.error('Error downloading CSV:', error);
                   alert('Failed to download CSV. Please try again.');
                  
                   // Reset button
                   this.innerHTML = originalText;
                   this.disabled = false;
               });
       });
   } else {
       console.error('CSV button not found!');
   }
  
});




// --------------------------------------------- LINE CHART FOR CO2 EMISSIONS --------------------------------------------- //
// logic is mine but AI (ChatGPT & Claude) helped write some advanced codes. Understood and reviewed the code.




const monthColors = { //each month has its own distinguished colours
  0: '#ef4444',
  1: '#f97316',
  2: '#f59e0b',
  3: '#eab308',
  4: '#84cc16',
  5: '#22c55e',
  6: '#10b981',
  7: '#14b8a6',
  8: '#06b6d4',
  9: '#0ea5e9',
  10: '#3b82f6',
  11: '#6366f1'
};




document.addEventListener('DOMContentLoaded', function() {
   fetch('/get_line_chart_data')
      .then(response => response.json())
      .then(data => {
          if (data.error) {
              console.error('Error fetching chart data:', data.error);
              return;
          }
        
          const currentTotal = data.current_total || 0;
          const lastTotal = data.last_total || 0;
          const difference = currentTotal - lastTotal;
          const percentChange = lastTotal !== 0 ? ((difference / lastTotal) * 100).toFixed(1) : 0;
        
          const percentageEl = document.getElementById('percentage-change');
          const differenceEl = document.getElementById('co2-difference');
        
          // stock market feature




          if (difference < 0) {
              percentageEl.innerHTML = `↓ ${Math.abs(percentChange)}%`;
              percentageEl.style.color = '#10b981';
              differenceEl.innerHTML = `${(difference * 1000).toFixed(1)}kg`; // updated to maintain consistency
          } else if (difference > 0) {
              percentageEl.innerHTML = `↑ ${percentChange}%`;
              percentageEl.style.color = '#ef4444';
              differenceEl.innerHTML = `+${(difference * 1000).toFixed(1)}kg`; // updated to maintain consistency
          } else {
              percentageEl.innerHTML = `→ 0%`;
              percentageEl.style.color = '#6b7280';
              differenceEl.innerHTML = `No change`;
          }
        
          const currentDate = new Date();
          const currentMonthNum = currentDate.getMonth();
          const currentMonthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
        
          const lastMonthDate = new Date();
          lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);
          const lastMonthNum = lastMonthDate.getMonth();
          const lastMonthName = lastMonthDate.toLocaleString('default', { month: 'long', year: 'numeric' });
        
          const currentColor = monthColors[currentMonthNum];
          const lastColor = monthColors[lastMonthNum];
        
          const currentMonthMap = {};
          data.current_month.forEach(item => {
              const date = new Date(item.date);
              const day = date.getDate();
              currentMonthMap[day] = item.co2;
          });
        
          const lastMonthMap = {};
          data.last_month.forEach(item => {
              const date = new Date(item.date);
              const day = date.getDate();
              lastMonthMap[day] = item.co2;
          });
        
          const currentDataPoints = [];
          const lastDataPoints = [];
        
          for (let day = 1; day <= 31; day++) {
              if (currentMonthMap[day] !== undefined) {
                  currentDataPoints.push({x: day, y: currentMonthMap[day] * 1000});
              }
              if (lastMonthMap[day] !== undefined) {
                  lastDataPoints.push({x: day, y: lastMonthMap[day] * 1000});
              }
          }
        
          const ctx = document.getElementById('co2LineChart').getContext('2d');
          new Chart(ctx, {
              type: 'line',
              data: {
                  datasets: [
                      {
                          label: `${currentMonthName}`,
                          data: currentDataPoints,
                          borderColor: currentColor,
                          backgroundColor: currentColor + '20',
                          tension: 0.4,
                          fill: false,
                          pointRadius: 4,
                          pointHoverRadius: 6,
                          borderWidth: 3,
                          spanGaps: true
                      },
                      {
                          label: `${lastMonthName}`,
                          data: lastDataPoints,
                          borderColor: lastColor,
                          backgroundColor: lastColor + '20',
                          tension: 0.4,
                          fill: false,
                          pointRadius: 4,
                          pointHoverRadius: 6,
                          borderWidth: 3,
                          spanGaps: true
                      }
                  ]
              },
              options: {
                  responsive: true,
                  maintainAspectRatio: true,
                  plugins: {
                      legend: {
                          display: true,
                          position: 'bottom',
                          labels: {
                              usePointStyle: true,
                              padding: 15,
                              font: {
                                  size: 13,
                                  family: "'Roboto', sans-serif"
                              },
                              generateLabels: function(chart) {
                                  const datasets = chart.data.datasets;
                                  return datasets.map((dataset, i) => ({
                                      text: `${dataset.label} (${i === 0 ? (currentTotal * 1000).toFixed(1) : (lastTotal * 1000).toFixed(1)}kg)`,
                                      fillStyle: dataset.borderColor,
                                      strokeStyle: dataset.borderColor,
                                      lineWidth: 2,
                                      hidden: false,
                                      index: i,
                                      pointStyle: 'circle'
                                  }));
                              }
                          }
                      },
                      tooltip: {
                          mode: 'nearest',
                          intersect: false,
                          backgroundColor: 'rgba(0, 0, 0, 0.8)',
                          padding: 12,
                          titleFont: {
                              size: 14,
                              family: "'Roboto', sans-serif"
                          },
                          bodyFont: {
                              size: 13,
                              family: "'Roboto', sans-serif"
                          },
                          callbacks: {
                              title: function(context) {
                                  return `Day ${context[0].parsed.x}`;
                              },
                              label: function(context) {
                                  
                                   return `${context.dataset.label}: ${context.parsed.y.toFixed(1)} kg CO₂`;
                               },
                              labelTextColor: function(context) {
                                  return context.dataset.borderColor;
                              }
                          }
                      }
                  },
                  scales: {
                      x: {
                          type: 'linear',
                          title: {
                              display: true,
                              text: 'Day of Month',
                              font: {
                                  size: 13,
                                  weight: '600',
                                  family: "'Roboto', sans-serif"
                              }
                          },
                          min: 1,
                          max: 31,
                          ticks: {
                              stepSize: 5,
                              font: {
                                  family: "'Roboto', sans-serif"
                              }
                          },
                          grid: {
                              display: true,
                              color: 'rgba(0, 0, 0, 0.05)'
                          }
                      },
                      y: {
                          beginAtZero: true,
                          title: {
                              display: true,
                              text: 'CO₂ Emissions (kg)',
                              font: {
                                  size: 13,
                                  weight: '600',
                                  family: "'Roboto', sans-serif"
                              }
                          },
                          ticks: {
                              font: {
                                  family: "'Roboto', sans-serif"
                              }
                          },
                          grid: {
                              color: 'rgba(0, 0, 0, 0.05)'
                          }
                      }
                  },
                  interaction: {
                      mode: 'nearest',
                      intersect: false
                  }
              }
          });
      })
      .catch(error => {
          console.error('Error loading line chart:', error);
      });
});








// ----------------------------------------- Donut chart JS For mode of Tranpsort------------------------------ //




const transportColors = {
  'plane': '#3b82f6',
  'train': '#10b981',
  'car': '#ef4444',
  'bus': '#f59e0b',
  'coach': '#f97316',
  'other': '#6b7280'
};




document.addEventListener('DOMContentLoaded', function() {
   fetch('/get_donut_chart_data')
      .then(response => response.json())
      .then(data => {
          if (data.error) {
              console.error('Error fetching donut chart data:', data.error);
              return;
          }
        
          document.getElementById('total-entries-number').textContent = data.total_entries;
        
          const labels = [];
          const counts = [];
          const colors = [];
        
          data.transport_data.forEach(item => {
              labels.push(item.transport);
              counts.push(item.count);
            
              const color = transportColors[item.transport] || '#6b7280';
              colors.push(color);
          });
        
          const ctx = document.getElementById('transportDonutChart').getContext('2d');
          new Chart(ctx, {
              type: 'doughnut',
              data: {
                  labels: labels,
                  datasets: [{
                      data: counts,
                      backgroundColor: colors,
                      borderWidth: 2,
                      borderColor: '#ffffff'
                  }]
              },
              options: {
                  responsive: true,
                  maintainAspectRatio: true,
                  cutout: '65%',
                  plugins: {
                      legend: {
                          display: true,
                          position: 'bottom',
                          labels: {
                              usePointStyle: true,
                              padding: 10,
                              font: {
                                  size: 11,
                                  family: "'Roboto', sans-serif"
                              },
                              generateLabels: function(chart) {
                                  const data = chart.data;
                                  return data.labels.map((label, i) => ({
                                      text: `${label} (${data.datasets[0].data[i]})`,
                                      fillStyle: data.datasets[0].backgroundColor[i],
                                      strokeStyle: data.datasets[0].backgroundColor[i],
                                      hidden: false,
                                      index: i
                                  }));
                              }
                          }
                      },
                      tooltip: {
                          backgroundColor: 'rgba(0, 0, 0, 0.8)',
                          padding: 12,
                          titleFont: {
                              size: 14,
                              family: "'Roboto', sans-serif"
                          },
                          bodyFont: {
                              size: 13,
                              family: "'Roboto', sans-serif"
                          },
                          callbacks: {
                              label: function(context) {
                                  const label = context.label || '';
                                  const value = context.parsed || 0;
                                  const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                  const percentage = ((value / total) * 100).toFixed(1);
                                  return `${label}: ${value} entries (${percentage}%)`;
                              }
                          }
                      }
                  }
              }
          });
      })
      .catch(error => {
          console.error('Error loading donut chart:', error);
      });
});


