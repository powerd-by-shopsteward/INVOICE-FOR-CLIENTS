document.addEventListener('DOMContentLoaded', () => {
    
    // Default items only load if there is no saved data
    const defaultItems = [
        { id: "srv-1", title: "Tier 1: Essentials, done right", desc: "First year setup included. Then ₹599/year from year 2.", rate: 2999 },
        { id: "srv-2", title: "Tier 2: Built around your shop", desc: "First year setup included. Then ₹599/year from year 2.", rate: 3999 },
        { id: "srv-3", title: "Tier 3: Full Custom", desc: "First year setup included. Then ₹599/year from year 2.", rate: 9999 },
        { id: "srv-4", title: "Add-on: WhatsApp Business Integration", desc: "Auto-send bills & udhaar reminders directly to customer WhatsApp.", rate: 1499 },
        { id: "srv-5", title: "Add-on: Data Migration & Setup", desc: "Import your existing inventory from Excel, Tally, or Vyapar.", rate: 999 }
    ];

    let items = [];

    const itemsContainer = document.getElementById('items-container');
    const addItemBtn = document.getElementById('add-item-btn');
    const accentColorInput = document.getElementById('accent-color');
    
    const inputsToTrack = [
        'biz-name', 'biz-address', 'biz-contact', 'client-name', 'client-address', 
        'inv-number', 'inv-date', 'po-number', 'subject-text',
        'tax1-name', 'tax1-rate', 'tax2-name', 'tax2-rate', 
        'discount-amount', 'terms-text'
    ];

    function numberToWords(num) {
        if (num === 0) return 'Zero';
        const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
        const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

        function inWords(n) {
            if (n < 20) return a[n];
            if (n < 100) return b[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + a[n % 10] : ' ');
            if (n < 1000) return a[Math.floor(n / 100)] + 'Hundred ' + (n % 100 !== 0 ? inWords(n % 100) : '');
            if (n < 100000) return inWords(Math.floor(n / 1000)) + 'Thousand ' + (n % 1000 !== 0 ? inWords(n % 1000) : '');
            if (n < 10000000) return inWords(Math.floor(n / 100000)) + 'Lakh ' + (n % 100000 !== 0 ? inWords(n % 100000) : '');
            return inWords(Math.floor(n / 10000000)) + 'Crore ' + (n % 10000000 !== 0 ? inWords(n % 10000000) : '');
        }

        let str = inWords(Math.floor(num)).trim();
        let paise = Math.round((num - Math.floor(num)) * 100);
        let result = "Indian Rupee " + str;
        if (paise > 0) { result += " and " + inWords(paise).trim() + " Paise"; }
        return result + " Only";
    }

    function formatCurrency(amount) { return '₹' + amount.toFixed(2); }

    // Re-renders the sidebar item inputs
    function renderSidebarItems() {
        itemsContainer.innerHTML = '';
        
        items.forEach((item) => {
            const div = document.createElement('div');
            div.className = 'item-row';
            div.innerHTML = `
                <button class="remove-item" data-id="${item.id}">×</button>
                <input type="text" class="item-title-input" data-id="${item.id}" placeholder="Service Title" value="${item.title}">
                <input type="text" class="item-desc-input" data-id="${item.id}" placeholder="Description" value="${item.desc}">
                <input type="number" class="item-rate-input" data-id="${item.id}" placeholder="Rate (₹)" value="${item.rate}">
            `;
            itemsContainer.appendChild(div);
        });
    }

    // Attach event listeners globally to the container (Event Delegation for reliability)
    itemsContainer.addEventListener('input', (e) => {
        const id = e.target.dataset.id;
        if (!id) return;

        const item = items.find(i => i.id === id);
        if (!item) return;

        if (e.target.classList.contains('item-title-input')) item.title = e.target.value;
        if (e.target.classList.contains('item-desc-input')) item.desc = e.target.value;
        if (e.target.classList.contains('item-rate-input')) item.rate = parseFloat(e.target.value) || 0;

        updatePreview();
    });

    itemsContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-item')) {
            const id = e.target.dataset.id;
            items = items.filter(i => i.id !== id);
            renderSidebarItems();
            updatePreview();
        }
    });

    function updatePreview() {
        // Text updates
        document.getElementById('preview-biz-name').innerText = document.getElementById('biz-name').value;
        document.getElementById('preview-biz-address').innerText = document.getElementById('biz-address').value;
        document.getElementById('preview-biz-contact').innerText = document.getElementById('biz-contact').value;
        
        document.getElementById('preview-client-name').innerText = document.getElementById('client-name').value;
        document.getElementById('preview-client-address').innerHTML = document.getElementById('client-address').value.replace(/\n/g, '<br>');
        document.getElementById('preview-ship-address').innerHTML = document.getElementById('client-address').value.replace(/\n/g, '<br>');
        
        document.getElementById('preview-inv-number').innerText = document.getElementById('inv-number').value;
        document.getElementById('preview-po-number').innerText = document.getElementById('po-number').value;
        document.getElementById('preview-subject-text').innerText = document.getElementById('subject-text').value;
        
        const dateVal = document.getElementById('inv-date').value;
        document.getElementById('preview-inv-date').innerText = dateVal ? new Date(dateVal).toLocaleDateString('en-GB') : '-';

        document.getElementById('preview-terms').innerText = document.getElementById('terms-text').value;

        // Table rendering
        const tableBody = document.getElementById('preview-table-body');
        tableBody.innerHTML = '';
        let subtotal = 0;
        let totalTax = 0;

        const tax1Rate = parseFloat(document.getElementById('tax1-rate').value) || 0;
        const tax2Rate = parseFloat(document.getElementById('tax2-rate').value) || 0;
        const totalTaxRate = tax1Rate + tax2Rate;

        items.forEach((item, index) => {
            const itemTax = item.rate * (totalTaxRate / 100);
            subtotal += item.rate;
            totalTax += itemTax;

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="text-center">${index + 1}</td>
                <td>
                    <div class="item-title">${item.title}</div>
                    <div class="item-desc">${item.desc}</div>
                </td>
                <td class="text-right">${formatCurrency(item.rate)}</td>
                <td class="text-right">${totalTaxRate > 0 ? totalTaxRate + '%' : ''}</td>
                <td class="text-right">${totalTaxRate > 0 ? formatCurrency(itemTax) : ''}</td>
                <td class="text-right amount-col">${formatCurrency(item.rate + itemTax)}</td>
            `;
            tableBody.appendChild(tr);
        });

        // Totals
        const tax1Name = document.getElementById('tax1-name').value || 'Tax 1';
        const tax2Name = document.getElementById('tax2-name').value || 'Tax 2';
        
        const tax1Amount = subtotal * (tax1Rate / 100);
        const tax2Amount = subtotal * (tax2Rate / 100);
        
        const discountAmount = parseFloat(document.getElementById('discount-amount').value) || 0;
        const grandTotal = subtotal + tax1Amount + tax2Amount - discountAmount;

        document.getElementById('preview-subtotal').innerText = formatCurrency(subtotal);
        
        if(tax1Rate > 0) {
            document.getElementById('row-tax1').style.display = 'table-row';
            document.getElementById('label-tax1').innerText = `${tax1Name} (${tax1Rate}%)`;
            document.getElementById('preview-tax1').innerText = formatCurrency(tax1Amount);
        } else { document.getElementById('row-tax1').style.display = 'none'; }

        if(tax2Rate > 0) {
            document.getElementById('row-tax2').style.display = 'table-row';
            document.getElementById('label-tax2').innerText = `${tax2Name} (${tax2Rate}%)`;
            document.getElementById('preview-tax2').innerText = formatCurrency(tax2Amount);
        } else { document.getElementById('row-tax2').style.display = 'none'; }

        if(discountAmount > 0) {
            document.getElementById('row-discount').style.display = 'table-row';
            document.getElementById('preview-discount').innerText = `(-) ${formatCurrency(discountAmount)}`;
        } else { document.getElementById('row-discount').style.display = 'none'; }

        document.getElementById('preview-grand-total').innerText = formatCurrency(grandTotal);
        document.getElementById('preview-words').innerText = numberToWords(grandTotal);

        saveData();
    }

    // Image Uploads
    document.getElementById('logo-upload').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                document.getElementById('preview-logo').src = event.target.result;
                document.getElementById('preview-logo').style.display = 'block';
                document.getElementById('logo-fallback').style.display = 'none';
                localStorage.setItem('invoice_logo', event.target.result);
            };
            reader.readAsDataURL(file);
        }
    });

    document.getElementById('signature-upload').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                document.getElementById('preview-signature').src = event.target.result;
                document.getElementById('preview-signature').style.display = 'block';
                localStorage.setItem('invoice_signature', event.target.result);
            };
            reader.readAsDataURL(file);
        }
    });

    accentColorInput.addEventListener('input', (e) => {
        const color = e.target.value;
        document.documentElement.style.setProperty('--primary', color);
        document.documentElement.style.setProperty('--primary-hover', color + 'cc'); 
        localStorage.setItem('invoice_accent', color);
    });

    // Local Storage
    function saveData() {
        const data = { items: items, fields: {} };
        inputsToTrack.forEach(id => { data.fields[id] = document.getElementById(id).value; });
        localStorage.setItem('invoice_data', JSON.stringify(data));
    }

    function loadData() {
        const savedData = localStorage.getItem('invoice_data');
        
        // Generate unique IDs for added items
        function generateId() {
            return 'srv-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
        }

        if (savedData) {
            const data = JSON.parse(savedData);
            if(data.items) items = data.items;
            if(data.fields) {
                Object.keys(data.fields).forEach(key => {
                    const el = document.getElementById(key);
                    if(el) el.value = data.fields[key];
                });
            }
        } else {
            items = [...defaultItems];
            document.getElementById('inv-date').valueAsDate = new Date();
        }

        // Setup Add Button
        addItemBtn.addEventListener('click', () => {
            items.push({ 
                id: generateId(), 
                title: "New Custom Service", 
                desc: "Description...", 
                rate: 0 
            });
            renderSidebarItems();
            updatePreview();
            // Scroll to bottom of sidebar
            document.querySelector('.scroll-area').scrollTop = document.querySelector('.scroll-area').scrollHeight;
        });

        const savedLogo = localStorage.getItem('invoice_logo');
        if(savedLogo) {
            document.getElementById('preview-logo').src = savedLogo;
            document.getElementById('preview-logo').style.display = 'block';
            document.getElementById('logo-fallback').style.display = 'none';
        }
        const savedSig = localStorage.getItem('invoice_signature');
        if(savedSig) {
            document.getElementById('preview-signature').src = savedSig;
            document.getElementById('preview-signature').style.display = 'block';
        }
        const savedAccent = localStorage.getItem('invoice_accent');
        if(savedAccent) {
            document.documentElement.style.setProperty('--primary', savedAccent);
            accentColorInput.value = savedAccent;
        }
        
        renderSidebarItems();
        updatePreview();
    }

    inputsToTrack.forEach(id => {
        document.getElementById(id).addEventListener('input', updatePreview);
    });

    document.getElementById('print-btn').addEventListener('click', () => { window.print(); });

    document.getElementById('clear-data-btn').addEventListener('click', () => {
        if(confirm("Are you sure you want to reset all data to defaults?")) { localStorage.clear(); location.reload(); }
    });

    loadData();
});
