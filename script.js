document.addEventListener('DOMContentLoaded', () => {
    
    // Default Items Data
    const defaultItems = [
        { id: Date.now() + 1, title: "Tier 1: Essentials, done right", desc: "First year setup included. Then ₹599/year from year 2.", rate: 2999 },
        { id: Date.now() + 2, title: "Tier 2: Built around your shop", desc: "First year setup included. Then ₹599/year from year 2.", rate: 3999 },
        { id: Date.now() + 3, title: "Tier 3: Full Custom", desc: "First year setup included. Then ₹599/year from year 2.", rate: 9999 },
        { id: Date.now() + 4, title: "Add-on: WhatsApp Business Integration", desc: "Auto-send bills & udhaar reminders directly to customer WhatsApp.", rate: 1499 },
        { id: Date.now() + 5, title: "Add-on: Data Migration & Setup", desc: "Import your existing inventory from Excel, Tally, or Vyapar.", rate: 999 }
    ];

    let items = [];

    // --- DOM Elements ---
    const itemsContainer = document.getElementById('items-container');
    const addItemBtn = document.getElementById('add-item-btn');
    const accentColorInput = document.getElementById('accent-color');
    
    // Inputs to track for live preview
    const inputsToTrack = [
        'biz-name', 'biz-address', 'biz-contact', 'client-name', 'client-address', 
        'inv-number', 'inv-date', 'tax1-name', 'tax1-rate', 'tax2-name', 'tax2-rate', 
        'discount-amount', 'terms-text'
    ];

    // --- Number to Words Converter (Indian System) ---
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
        if (paise > 0) {
            result += " and " + inWords(paise).trim() + " Paise";
        }
        return result + " Only";
    }

    // --- Currency Formatter ---
    function formatCurrency(amount) {
        return '₹' + amount.toFixed(2);
    }

    // --- Render Items in Sidebar ---
    function renderSidebarItems() {
        itemsContainer.innerHTML = '';
        items.forEach((item, index) => {
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

        // Attach listeners to new inputs
        document.querySelectorAll('.item-title-input').forEach(input => {
            input.addEventListener('input', (e) => {
                const id = parseInt(e.target.dataset.id);
                const item = items.find(i => i.id === id);
                item.title = e.target.value;
                updatePreview();
            });
        });

        document.querySelectorAll('.item-desc-input').forEach(input => {
            input.addEventListener('input', (e) => {
                const id = parseInt(e.target.dataset.id);
                const item = items.find(i => i.id === id);
                item.desc = e.target.value;
                updatePreview();
            });
        });

        document.querySelectorAll('.item-rate-input').forEach(input => {
            input.addEventListener('input', (e) => {
                const id = parseInt(e.target.dataset.id);
                const item = items.find(i => i.id === id);
                item.rate = parseFloat(e.target.value) || 0;
                updatePreview();
            });
        });

        document.querySelectorAll('.remove-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.target.dataset.id);
                items = items.filter(i => i.id !== id);
                renderSidebarItems();
                updatePreview();
            });
        });
    }

    // --- Render Preview & Calculate Totals ---
    function updatePreview() {
        // Update text fields
        document.getElementById('preview-biz-name').innerText = document.getElementById('biz-name').value;
        document.getElementById('preview-biz-address').innerText = document.getElementById('biz-address').value;
        document.getElementById('preview-biz-contact').innerText = document.getElementById('biz-contact').value;
        
        document.getElementById('preview-client-name').innerText = document.getElementById('client-name').value;
        document.getElementById('preview-client-address').innerHTML = document.getElementById('client-address').value.replace(/\n/g, '<br>');
        
        document.getElementById('preview-inv-number').innerText = document.getElementById('inv-number').value;
        
        // Date formatting
        const dateVal = document.getElementById('inv-date').value;
        if(dateVal) {
            const d = new Date(dateVal);
            document.getElementById('preview-inv-date').innerText = d.toLocaleDateString('en-GB'); // DD/MM/YYYY
        } else {
            document.getElementById('preview-inv-date').innerText = '-';
        }

        // Terms
        document.getElementById('preview-terms').innerText = document.getElementById('terms-text').value;

        // Render Table Items
        const tableBody = document.getElementById('preview-table-body');
        tableBody.innerHTML = '';
        let subtotal = 0;

        items.forEach((item, index) => {
            subtotal += item.rate;
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${index + 1}</td>
                <td>
                    <div class="item-title">${item.title}</div>
                    <div class="item-desc">${item.desc}</div>
                </td>
                <td class="text-right">${formatCurrency(item.rate)}</td>
                <td class="text-right amount-col">${formatCurrency(item.rate)}</td>
            `;
            tableBody.appendChild(tr);
        });

        // Calculations
        const tax1Rate = parseFloat(document.getElementById('tax1-rate').value) || 0;
        const tax2Rate = parseFloat(document.getElementById('tax2-rate').value) || 0;
        const tax1Name = document.getElementById('tax1-name').value || 'Tax 1';
        const tax2Name = document.getElementById('tax2-name').value || 'Tax 2';
        
        const tax1Amount = subtotal * (tax1Rate / 100);
        const tax2Amount = subtotal * (tax2Rate / 100);
        
        const discountAmount = parseFloat(document.getElementById('discount-amount').value) || 0;
        
        const grandTotal = subtotal + tax1Amount + tax2Amount - discountAmount;

        // Update Totals UI
        document.getElementById('preview-subtotal').innerText = formatCurrency(subtotal);
        
        // Tax 1
        if(tax1Rate > 0) {
            document.getElementById('row-tax1').style.display = 'table-row';
            document.getElementById('label-tax1').innerText = `${tax1Name} (${tax1Rate}%)`;
            document.getElementById('preview-tax1').innerText = formatCurrency(tax1Amount);
        } else {
            document.getElementById('row-tax1').style.display = 'none';
        }

        // Tax 2
        if(tax2Rate > 0) {
            document.getElementById('row-tax2').style.display = 'table-row';
            document.getElementById('label-tax2').innerText = `${tax2Name} (${tax2Rate}%)`;
            document.getElementById('preview-tax2').innerText = formatCurrency(tax2Amount);
        } else {
            document.getElementById('row-tax2').style.display = 'none';
        }

        // Discount
        if(discountAmount > 0) {
            document.getElementById('row-discount').style.display = 'table-row';
            document.getElementById('preview-discount').innerText = `(-) ${formatCurrency(discountAmount)}`;
        } else {
            document.getElementById('row-discount').style.display = 'none';
        }

        document.getElementById('preview-grand-total').innerText = formatCurrency(grandTotal);
        document.getElementById('preview-words').innerText = numberToWords(grandTotal);

        saveData();
    }

    // --- Image Upload Handlers ---
    document.getElementById('logo-upload').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                const base64 = event.target.result;
                const img = document.getElementById('preview-logo');
                const fallback = document.getElementById('logo-fallback');
                img.src = base64;
                img.style.display = 'block';
                fallback.style.display = 'none';
                localStorage.setItem('invoice_logo', base64);
            };
            reader.readAsDataURL(file);
        }
    });

    document.getElementById('signature-upload').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                const base64 = event.target.result;
                const img = document.getElementById('preview-signature');
                img.src = base64;
                img.style.display = 'block';
                localStorage.setItem('invoice_signature', base64);
            };
            reader.readAsDataURL(file);
        }
    });

    // --- Accent Color Logic ---
    accentColorInput.addEventListener('input', (e) => {
        const color = e.target.value;
        document.documentElement.style.setProperty('--primary', color);
        // Darken for hover
        document.documentElement.style.setProperty('--primary-hover', color + 'cc'); 
        localStorage.setItem('invoice_accent', color);
    });

    // --- Data Persistence (Local Storage) ---
    function saveData() {
        const data = {
            items: items,
            fields: {}
        };
        inputsToTrack.forEach(id => {
            data.fields[id] = document.getElementById(id).value;
        });
        localStorage.setItem('invoice_data', JSON.stringify(data));
    }

    function loadData() {
        const savedData = localStorage.getItem('invoice_data');
        
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
            // Default state
            items = [...defaultItems];
            document.getElementById('inv-date').valueAsDate = new Date();
        }

        // Load Branding
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

    // --- Event Listeners ---
    inputsToTrack.forEach(id => {
        document.getElementById(id).addEventListener('input', updatePreview);
    });

    addItemBtn.addEventListener('click', () => {
        items.push({
            id: Date.now(),
            title: "New Custom Service",
            desc: "Description of service...",
            rate: 0
        });
        renderSidebarItems();
        updatePreview();
    });

    document.getElementById('print-btn').addEventListener('click', () => {
        window.print();
    });

    document.getElementById('clear-data-btn').addEventListener('click', () => {
        if(confirm("Are you sure you want to reset all data? This cannot be undone.")) {
            localStorage.clear();
            location.reload();
        }
    });

    // Initialize
    loadData();
});
