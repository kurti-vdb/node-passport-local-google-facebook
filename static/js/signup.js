function floatingLabels() {
    var $formControl = $('.form-control');
  
    $formControl.each(function() {
      var $t = $(this),
        $p = $t.parents('.form-group');
  
      $t.on('keyup change', function() {
        if ($(this).val().length > 0) {
          $p.addClass('filled');
        } else {
          $p.removeClass('filled');
        }
      }).on('focus', function() {
        $p.addClass('focus');
      }).on('blur', function() {
        $p.removeClass('focus');
        if ($t.val().length <= 1) {
          $p.addClass('error');
        } else {
          $p.removeClass('error');
        }
      });
    });
  }
  
  /*-----------------------
  Reveal & Check Password
  -----------------------*/
  function revealPassword() {
    var $reveal = $('.reveal-password'),
      $password = $('#signup-password'),
      $pwdSuggestion = $('#password-suggestion');
  
    $password.on('keyup change', function() {
      var $t = $(this),
          $p = $t.parents('.form-group'),
          val = $t.val(),
          result = zxcvbn(val, userInputs = []);
  
      if (val.length > 0) {
        $reveal.show();
        $pwdSuggestion.show();
  
        if (parseInt(result.score) > 2) {
          $pwdSuggestion.html('');
          $p.removeClass('error');
        } else {
          if (result.feedback.warning == '') {
            result.feedback.warning = 'Your password is too short';
          }
          $p.addClass('error');
          $pwdSuggestion.html(result.feedback.warning + '. ' + result.feedback.suggestions.join(' '));
        }
      } else {
        $pwdSuggestion.hide();
      }
  
    });
  
    $reveal.click(function() {
      var $t = $(this),
          $p = $t.parents('.form-group');
  
      $t.toggleClass('active');
      $p.toggleClass('focus');
  
      var type = ($(this).is('.active')) ? 'text' : 'password';
      $password.attr('type', type);
    });
  }
  
  /*-----------------
  Email Suggestion
  -----------------*/
  function emailSuggestion() {
    var domains = 'yahoo.com outlook.com google.com hotmail.com inbox.com gmail.com me.com aol.com mac.com lycos.com live.com comcast.net googlemail.com msn.com hotmail.co.uk yahoo.co.uk facebook.com verizon.net sbcglobal.net att.net gmx.com mail.com'.split(' '),
      topLevelDomains = 'co.uk com net org info edu gov mil'.split(' '),
      $email = $('#signup-email'),
      $suggestion = $('#email-suggestion'),
      $suggestedEmail = $('#suggested-email');
  
    $email.on('blur', function() {
      var $t = $(this),
        $p = $t.parents('.form-group');
  
      // check if it's an email
      var pattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/i;
      if (pattern.test($t.val()) == false) {
        $p.addClass('error');
      } else {
        $p.removeClass('error');
      }
  
      $t.mailcheck({
        domains: domains,
        topLevelDomains: topLevelDomains,
        suggested: function(element, suggestion) {
          $suggestion.slideDown(300);
          $suggestedEmail.html('<a id="suggested-email"><span class="address">' + suggestion.address + '</span>@<span class="domain">' + suggestion.domain + '</span></a>');
        }
      });
    });
  
    // recover
    $suggestedEmail.click(function() {
      $email.val($(this).text());
      $suggestion.slideUp(300);
    });
  }
  
  /*--------
  DOC READY
  ----------*/
  $(function() {
    floatingLabels();
    revealPassword();
    emailSuggestion();
  });