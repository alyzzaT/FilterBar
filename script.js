document.addEventListener("DOMContentLoaded", () => {
    const selectBtns = document.querySelectorAll(".select-btn");
    let activeBtn = null;
    const items = document.querySelectorAll('.item');

    // Initially display "No results found" message when no filters are selected
    displayFilteredResults([]);

    // Handle dropdown toggling
    selectBtns.forEach(selectBtn => {
        selectBtn.addEventListener('click', () => {
            if (activeBtn && activeBtn !== selectBtn) {
                activeBtn.classList.remove('open');
                activeBtn.querySelector('.arrow-dwn').classList.remove('rotate');
            }
            selectBtn.classList.toggle('open');
            const arrow = selectBtn.querySelector('.arrow-dwn');
            arrow.classList.toggle('rotate');
            activeBtn = selectBtn.classList.contains('open') ? selectBtn : null;
        });
    });

    // Handle item selection/deselection
    items.forEach(item => {
        item.addEventListener('click', () => {
            item.classList.toggle('checked');
            item.classList.toggle('highlight');
            const itemName = item.querySelector('.item-text').textContent;
            const isSelected = item.classList.contains('checked');
            const filterGroup = item.closest('.container').querySelector('.btn-text')?.textContent; // Get the filter group name directly
            
            logItemAction(itemName, isSelected, filterGroup);
        });
    });
});

// Function to log the item action (selected/deselected) to the backend
function logItemAction(itemName, isSelected, filterGroup) {
    const action = isSelected ? "selected" : "deselected";

    // Create an array of the selected items to send to the backend
    const selectedItems = Array.from(document.querySelectorAll('.item.checked')).map(item => {
        return item.querySelector('.item-text').textContent;  // Or use .id if you're using IDs for the items
    });

    // If no items are selected, don't send to the backend and just show the "No results found" message
    if (selectedItems.length === 0) {
        displayFilteredResults([]); // Show "No results found" when nothing is selected
    } else {
        // Send the selected items list to the backend to get filtered results
        fetch('/api/filter/logItemAction', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ itemName: itemName, action: action, filterGroup: filterGroup, selectedItems: selectedItems })
        })
        .then(response => response.json())
        .then(data => {
            displayFilteredResults(data);
        })
        .catch(error => {
            console.error('Error logging item action:', error);
        });
    }
}

// Function to display the filtered results in the frontend
function displayFilteredResults(data) {
    const resultsDiv = document.getElementById('results');
    const ul = document.createElement('ul');

    // Remove any previous results
    resultsDiv.innerHTML = "";

    if (Array.isArray(data) && data.length > 0) {
        // Display the selected results if there are any
        data.forEach(item => {
            const li = document.createElement('li');
            li.textContent = `${item.name} (ID: ${item.id})`;  // Display ID, name, and filter group
            ul.appendChild(li);
        });
    } else {
        // Display "No results found" message if no filters are selected or data is empty
        const li = document.createElement('li');
        li.textContent = "No selected filters.";
        ul.appendChild(li);
    }

    resultsDiv.appendChild(ul);
}
