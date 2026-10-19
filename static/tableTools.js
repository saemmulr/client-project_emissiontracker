/* Filter dropdown behaviour */

document.addEventListener('DOMContentLoaded', () => {
    const filterContainer = document.getElementById('filter-container');
    const filterDropdown = document.getElementById('filter-dropdown');
    const filterButton = document.getElementById('filter-button');

    if (filterContainer && filterDropdown && filterButton) {
        // Show dropdown on hover
        filterContainer.addEventListener('mouseenter', () => {
            filterDropdown.style.display = 'block';
        });

        // Hide dropdown only when leaving the entire container
        filterContainer.addEventListener('mouseleave', () => {
            filterDropdown.style.display = 'none';
        });
    }
});

/* Search Function */

function searchTable(tableId, query) {
    const table = document.getElementById(tableId);
    const rows = table.getElementsByTagName("tr");
    query = query.toLowerCase();

    for (let i = 1; i < rows.length; i++) {
        const cells = rows[i].getElementsByTagName("td");
        let match = false;

        for (let j = 0; j < cells.length; j++) {
            if (cells[j].innerText.toLowerCase().includes(query)) {
                match = true;
                break;
            }
        }

        rows[i].style.display = match ? "" : "none";
    }
}

/* ========== Main filter function ========== */

function applyFilter(tableId, filterType, value = null) {
    const table = document.getElementById(tableId);
    const tbody = table.querySelector("tbody");
    const rows = Array.from(tbody.querySelectorAll("tr"));

    // Reset table visibility before filtering
    rows.forEach(row => row.style.display = "");

    switch (filterType) {

        /* ---- MOST RECENT ---- */
        case "recent":
            rows.sort((a, b) => {
                const dateA = new Date(a.children[1].innerText);
                const dateB = new Date(b.children[1].innerText);
                return dateB - dateA; // newest → oldest
            });
            break;

        /* ---- SINGLE OR RETURN ---- */
        case "single_return":
            rows.forEach(row => {
                const colValue = row.children[5].innerText.toLowerCase();
                row.style.display = colValue === value.toLowerCase() ? "" : "none";
            });
            return; // stop here because we are filtering, not sorting

        /* ---- CLASS FILTER ---- */
        case "class":
            rows.forEach(row => {
                const colValue = row.children[6].innerText.toLowerCase();
                row.style.display = colValue === value.toLowerCase() ? "" : "none";
            });
            return;

        /* ---- MODE OF TRANSPORT ---- */
        case "transport":
            rows.forEach(row => {
                const colValue = row.children[7].innerText.toLowerCase();
                row.style.display = colValue === value.toLowerCase() ? "" : "none";
            });
            return;

        /* ---- MILES: HIGH → LOW ---- */
        case "miles":
            rows.sort((a, b) => {
                const milesA = parseFloat(a.children[8].innerText);
                const milesB = parseFloat(b.children[8].innerText);
                return milesB - milesA;
            });
            break;

        /* ---- CO2: HIGH → LOW ---- */
        case "co2":
            rows.sort((a, b) => {
                const co2A = parseFloat(a.children[9].innerText);
                const co2B = parseFloat(b.children[9].innerText);
                return co2B - co2A;
            });
            break;

        default:
            console.warn("Unknown filter:", filterType);
            return;
    }

    // Re-attach sorted rows
    rows.forEach(r => tbody.appendChild(r));
}
