const app = {};

((app => {
    let database = firebase.database().ref('productsInCart');

    // Initializing variables for storing calculated numeric values
    app.total = 0;
    app.discountedPrice = 0;
    app.quantity = 0;

    // Function for discount logic
    app.discount = () => {
        let quantity = 0;

        $('.amt').html(app.total);
        $('.qty').each((i) => {
            if (parseInt($('.qty').eq(i - 1).html())) {
                quantity = quantity + parseInt($('.qty').eq(i - 1).html());
            }
            app.quantity = quantity;
        });

        if (quantity == 3) {
            app.discountedPrice = parseInt(app.total * .95);
        } else if (quantity > 3 && quantity <= 6) {
            app.discountedPrice = parseInt(app.total * .90);
        } else if (quantity >= 10) {
            app.discountedPrice = parseInt(app.total * .75);
        } else {
            app.discountedPrice = app.total;
        }
        $('#disc-total').html(app.discountedPrice);
    }

    // Initialization Function
    app.init = () => {
        // Applying listener on database object
        database.on('value', snapshot => {

            // Extracting Key-Value pairs
            let extractKeys = Object.keys(snapshot.val());

            // Flowing through the extracted Keys to extract and display data on UI
            extractKeys.forEach((item) => {
                let count = parseInt(item) + 1;

                // Clone the template and display it
                let template = $('#template').clone();
                template.removeClass('hide');

                // Fill the template with extracted data from Firebase
                template.find('h3').html(snapshot.val()[item].p_name.toUpperCase());
                template.find('#item-image').attr('src', snapshot.val()[item].p_image);
                template.find('#item-style').children().eq(1).html(snapshot.val()[item].p_style);
                template.find('#item-color').children().eq(1).html(snapshot.val()[item].p_selected_color.name);
                template.find('#item-size').children().eq(1).html(snapshot.val()[item].p_selected_size.name);
                template.find('#item-size-dk').children().eq(1).html(snapshot.val()[item].p_selected_size.name);
                template.find('#item-quantity').children().eq(1).html(snapshot.val()[item].p_quantity);
                template.find('#item-quantity-dk').children().eq(1).html(snapshot.val()[item].p_quantity);
                template.find('#item-rate').children().eq(1).html(parseInt(snapshot.val()[item].p_price) * parseInt(snapshot.val()[item].p_quantity));
                template.find('#item-rate-dk').children().eq(1).html(parseInt(snapshot.val()[item].p_price) * parseInt(snapshot.val()[item].p_quantity));
                template.find('#item-rate').attr('id', `rate${count}`);
                template.find('.edit-button').attr('id', item);

                app.total += parseInt(parseInt(snapshot.val()[item].p_price) * parseInt(snapshot.val()[item].p_quantity));

                template.find('.edit-button').on('click', e => {

                    e.preventDefault(); // To prevent by default submission by edit button

                    let currentItem = e.currentTarget.id;
                    database.once('value', snapshot => {
                        $('#modal-product').html(snapshot.val()[currentItem].p_name.toUpperCase());
                        $('#modal-rate').html(`$ ${snapshot.val()[currentItem].p_price}`);
                        $('#modal-img').attr('src', snapshot.val()[currentItem].p_image);

                        let colors = snapshot.val()[currentItem].p_available_options.colors;
                        let colorsArrayLength = colors.length;

                        for (let i = 0; i < colorsArrayLength; i++) {
                            let dynamicColorButton = $("<button type='button' class='button-color btn'></button>");

                            app.setButtonAttributes = () => {
                                dynamicColorButton.css("background-color", snapshot.val()[currentItem].p_available_options.colors[i].hexcode);
                                dynamicColorButton.attr('id', snapshot.val()[currentItem].p_available_options.colors[i].hexcode);
                                dynamicColorButton.attr('name', snapshot.val()[currentItem].p_available_options.colors[i].name);
                            };

                            app.setButtonAttributes();

                            $('#modal-color').append(dynamicColorButton);
                        }

                        $('.btn').on('click', e => {
                            e.preventDefault();
                            database.child(currentItem).child('p_selected_color').set({
                                hexcode: e.currentTarget.id,
                                name: e.currentTarget.name
                            });
                        });
                    });

                    $('#my-modal').toggle();

                    $('#modal-form').submit(event => {
                        if ($('#item-size-modal :selected').html() == 'Size') {
                            alert('Select a size before proceeding');
                            event.preventDefault();
                        }
                        if ($('#item-qty-modal :selected').html() == 'Qty') {
                            alert('Select quantity before proceeding');
                            event.preventDefault();
                        } else {
                            database.child(currentItem).child('p_selected_size').set({
                                name: $('#item-size-modal :selected').html()
                            });
                            database.child(currentItem).child('p_quantity').set(
                                $('#item-qty-modal :selected').html()
                            );

                            let list = $(e.currentTarget).parent().parent().children().children().children();
                            snapshot.val()[item].p_quantity = $('#item-size-modal :selected').html();
                            list.eq(3).children().eq(1).html($('#item-size-modal :selected').html());
                            list.eq(4).children().eq(1).html(parseInt($('#item-qty-modal :selected').html()));
                            app.discount();
                        }
                    });
                });
                $('.container-fluid').append(template);
            });
            app.discount();

            $('.item-count').html(`${app.quantity/2} ITEMS`);
        });
    };
    app.init();

    // Close the modal when the cross button is clicked
    $('.close').on('click', () => {
        $('#modal-color').empty()
        $('#my-modal').hide();
    });

    // Close the modal if clicked anywhere noutside modal body
    app.modal = document.getElementById('my-modal');
    window.onclick = event => {
        if (event.target == app.modal) {
            app.modal.style.display = 'none';
            $('#modal-color').empty();
        }
    }

}))(app);