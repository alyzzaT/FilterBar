document.addEventListener("DOMContentLoaded", () => {
    const selectBtns = document.querySelectorAll(".select-btn");
    let activeBtn = null;
    const items = document.querySelectorAll('.item');

    // will intially display "No results found" message when no filters are selected
    displayFilteredResults([]);

    // dropdown toggling
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

    // item selection/deselection
    items.forEach(item => {
        item.addEventListener('click', () => {
            item.classList.toggle('checked');
            item.classList.toggle('highlight');
            const itemName = item.querySelector('.item-text').textContent;
            const isSelected = item.classList.contains('checked');
            const filterGroup = item.closest('.container').querySelector('.btn-text')?.textContent; // gets the filter group name directly
            
            logItemAction(itemName, isSelected, filterGroup);
        });
    });
});

// (selected/deselected) to the backend
function logItemAction(itemName, isSelected, filterGroup) {
    const action = isSelected ? "selected" : "deselected";

    // creates an array of the selected items to send to the backend
    const selectedItems = Array.from(document.querySelectorAll('.item.checked')).map(item => {
        return item.querySelector('.item-text').textContent;  // Or use .id if you're using IDs for the items
    });

    // if no items are selected, don't send to the backend and just show the "No results found" message
    if (selectedItems.length === 0) {
        displayFilteredResults([]); // Show "No results found" when nothing is selected
    } else {
        // sends the selected items list to the backend to get filtered results
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

// displays the filtered results in the frontend
function displayFilteredResults(data) {
    const resultsDiv = document.getElementById('results');
    const ul = document.createElement('ul');

    // remoces any previous results
    resultsDiv.innerHTML = "";

    if (Array.isArray(data) && data.length > 0) {
        // displays the selected results if there are any
        data.forEach(item => {
            const li = document.createElement('li');
            li.textContent = `${item.name} (ID: ${item.id})`;  // displays ID, name, and filter group
            ul.appendChild(li);
        });
    } else {
        // displays "No results found" message if no filters are selected or data is empty
        const li = document.createElement('li');
        li.textContent = "No selected filters.";
        ul.appendChild(li);
    }

    resultsDiv.appendChild(ul);
}
