$(document).ready(function() {
    const products = [
        { id: 1, name: "טוסט גבינה ונקניק", price: 15 },
        { id: 2, name: "גאיה המושחתת", price: 20 },
        { id: 3, name: "לחמני קלאסי", price: 10 },
        { id: 4, name: "הר אקשטיין", price: 25 },
        // Add more products as needed
    ];

    let totalPrice = 0;
    let deliveryOption = ""; // Set to empty initially
    let selectedRestaurant = $("#restaurant-select option:first").val(); // Default to first restaurant
    let paymentOption = ""; // Set to empty initially
    let orderedProducts = []; // Array to hold ordered products

    // Set default restaurant
    $('#restaurant-select').val(selectedRestaurant);

    // Handle delivery or pickup option
    $('#pickup-btn').on('click', function() {
        deliveryOption = "pickup";
        $('#address-section').hide();
        $('#delivery-pickup-section').hide();
        $('#product-selection').show();
        updateProducts();
        showPaymentOptions(); // Show payment options after selecting pickup
    });

    $('#delivery-btn').on('click', function() {
        deliveryOption = "delivery";
        $('#address-section').show();
        $('#delivery-pickup-section').hide();
    });

    // Validate and proceed to menu display
    $('#address-input').on('input', function() {
        const address = $('#address-input').val();
        if (validateAddress(address)) {
            $('#product-selection').show();
            updateProducts();
            showPaymentOptions(); // Show payment options after entering a valid address
        }
    });

    // Update products based on selected restaurant
    function updateProducts() {
        $("#products-container").empty();
        products.forEach(product => {
            $("#products-container").append(`
                <div class="form-group mb-3">
                    <label>${product.name} - ₪${product.price}</label>
                    <input type="number" min="0" class="form-control quantity-input" data-id="${product.id}" data-price="${product.price}" style="width: 100px; display: inline-block; margin-right: 10px;" value="0">
                </div>
            `);
        });
    }

    // Calculate total price
    $(document).on('input', '.quantity-input', function() {
        totalPrice = 0;
        orderedProducts = []; // Reset ordered products

        $(".quantity-input").each(function() {
            const price = parseInt($(this).data('price'));
            const quantity = parseInt($(this).val());

            if (quantity > 0) {
                orderedProducts.push({
                    name: $(this).closest('.form-group').find('label').text(),
                    quantity: quantity,
                    price: price * quantity
                });
            }

            totalPrice += price * quantity;
        });

        $("#total-price").text("₪" + totalPrice);
        $('#submit-order-btn').show(); // Show submit button when products are selected
    });

    // Show payment options after menu selection
    function showPaymentOptions() {
        const paymentOptionsHtml = `
            <h4>בחר אפשרות תשלום</h4>
            <button id="pay-now-btn" class="btn btn-outline-secondary me-2">תשלום באתר</button>
            <button id="pay-later-btn" class="btn btn-outline-secondary">תשלום במקום</button>
        `;
        $('#payment-section').html(paymentOptionsHtml).show();

        // Handle payment option
        $('#pay-now-btn').on('click', function() {
            paymentOption = "payNow";
            showPaymentForm();
        });

        $('#pay-later-btn').on('click', function() {
            paymentOption = "payLater";
            disableInputs();
            displayReceipt();
        });
    }

    // Show payment form if user selects pay now
    function showPaymentForm() {
        const paymentFormHtml = `
            <div id="payment-form" class="mb-4">
                <h4>פרטי תשלום</h4>
                <div class="form-group">
                    <label for="card-number">מספר כרטיס אשראי</label>
                    <input type="text" id="card-number" class="form-control" placeholder="1234 5678 9012 3456" required>
                </div>
                <div class="form-group">
                    <label for="expiry-date">תוקף כרטיס (MM/YY)</label>
                    <input type="text" id="expiry-date" class="form-control" placeholder="MM/YY" required>
                </div>
                <div class="form-group">
                    <label for="cvv">CVV</label>
                    <input type="text" id="cvv" class="form-control" placeholder="123" required>
                </div>
                <button id="confirm-payment-btn" class="btn btn-primary mt-3">בצע תשלום</button>
            </div>
        `;
        $('#payment-section').html(paymentFormHtml).show();

        $('#confirm-payment-btn').on('click', function() {
            const cardNumber = $('#card-number').val();
            const expiryDate = $('#expiry-date').val();
            const cvv = $('#cvv').val();

            if (!validateCardDetails(cardNumber, expiryDate, cvv)) {
                alert("פרטי התשלום לא תקינים. אנא בדוק שוב.");
                return;
            }

            disableInputs();
            displayReceipt();
        });
    }

    // Validate card details
    function validateCardDetails(cardNumber, expiryDate, cvv) {
        const cardRegex = /^[0-9]{16}$/;
        const expiryRegex = /^(0[1-9]|1[0-2])\/[0-9]{2}$/;
        const cvvRegex = /^[0-9]{3}$/;

        return cardRegex.test(cardNumber) && expiryRegex.test(expiryDate) && cvvRegex.test(cvv);
    }

    // Disable quantity inputs after order placement
    function disableInputs() {
        $('.quantity-input').prop('disabled', true);
        $('#submit-order-btn').hide();
    }

    // Display the receipt
    function displayReceipt() {
        const address = $('#address-input').val();
        const selectedAddress = deliveryOption === "pickup" ? "איסוף מהמסעדה" : address;

        let productDetails = orderedProducts.map(product => {
            return `${product.name}: ${product.quantity} x ₪${product.price / product.quantity} = ₪${product.price}`;
        }).join('<br>');

        const receipt = `
            <strong>מסעדה:</strong> ${selectedRestaurant}<br>
            <strong>כתובת:</strong> ${selectedAddress}<br>
            <strong>מוצרים שהוזמנו:</strong><br>${productDetails}<br>
            <strong>סה"כ לתשלום:</strong> ₪${totalPrice}<br>
            <strong>סטטוס תשלום:</strong> ${paymentOption === "payNow" ? "שולם באתר" : "ישולם במקום"}
        `;
        $('#receipt-content').html(receipt);
        $('#receipt-section').show();
        $('#payment-section').hide(); // Hide the payment form after submission
    }

    // Validate address format
    function validateAddress(address) {
        const addressRegex = /^[a-zA-Z\u0590-\u05FF0-9\s\-]+$/;
        return addressRegex.test(address);
    }
});
