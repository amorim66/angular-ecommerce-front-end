$(document).ready(function(){

	// Função para aumentar a fonte
	$('#btn-aumentar-fonte').click(function(){
		var fontSize = parseInt($('body').css('font-size'));
		fontSize += 1;
		$('body').css('font-size', fontSize + 'px');
	});

	// Função para diminuir a fonte
	$('#btn-diminuir-fonte').click(function(){
		var fontSize = parseInt($('body').css('font-size'));
		fontSize -= 1;
		$('body').css('font-size', fontSize + 'px');
	});

	// Função para ativar/desativar o alto contraste
	$('#btn-alto-contraste').click(function(){
        console.log("passou");
        $('body').toggleClass('alto-contraste');
        $('img').toggleClass('grayscale');
        if ($('body').hasClass('alto-contraste')) {
            $('body').css('color', '#fff');
            $('.navbar').addClass('bg-dark text-warning');
            $('.navbar-nav .nav-link').addClass('text-warning');
        } else {
            $('body').css('color', '');
            $('.navbar').removeClass('bg-dark text-warning');
            $('.navbar-nav .nav-link').removeClass('text-warning');
        }
    });

});