(function(window){
  window.extractData = function() {
    var ret = $.Deferred();

    function onError() {
      console.log('Loading error', arguments);
      ret.reject();
    }

    async function onReady(smart)  {
      console.log(smart);
      if (smart.hasOwnProperty('patient')) {
        var patient = smart.patient;
        var pt = await patient.read();
        
        // fhir-client v2: smart.patient.api may be undefined if fhir.js is not linked.
        // Use the new client.request which is always available on the client instance.
        var codesArr = ['http://loinc.org|8302-2', 'http://loinc.org|8462-4',
                        'http://loinc.org|8480-6', 'http://loinc.org|2085-9',
                        'http://loinc.org|2089-1', 'http://loinc.org|55284-4'];
        var codesParam = codesArr.join(',');
        var obv = await smart.patient.request({
                    url: 'Observation?code=' + encodeURIComponent(codesParam)
                  }, { flat: true });

        $.when(pt, obv).fail(onError);

        $.when(pt, obv).done(function(patient, obv) {
          var byCodes = smart.byCodes(obv || [], 'code');
          var gender = patient.gender;

          var fname = '';
          var lname = '';

          if (patient && patient.name && patient.name.length > 0 && typeof patient.name[0] !== 'undefined') {
            fname = (patient.name[0].given || []).join(' ');
            lname = patient.name[0].family || '';
          }

          var height = byCodes('8302-2') || [];
          var bpList = byCodes('55284-4') || [];
          var systolicbp = getBloodPressureValue(bpList, '8480-6');
          var diastolicbp = getBloodPressureValue(bpList, '8462-4');
          var hdl = byCodes('2085-9') || [];
          var ldl = byCodes('2089-1') || [];

          var p = defaultPatient();
          p.birthdate = patient.birthDate;
          p.gender = gender;
          p.fname = fname;
          p.lname = lname;
          p.height = (height && height.length) ? getQuantityValueAndUnit(height[0]) : undefined;

          if (typeof systolicbp != 'undefined')  {
            p.systolicbp = systolicbp;
          }

          if (typeof diastolicbp != 'undefined') {
            p.diastolicbp = diastolicbp;
          }

          p.hdl = (hdl && hdl.length) ? getQuantityValueAndUnit(hdl[0]) : undefined;
          p.ldl = (ldl && ldl.length) ? getQuantityValueAndUnit(ldl[0]) : undefined;

          ret.resolve(p);
        });
      } else {
        onError();
      }
    }

    FHIR.oauth2.ready().then(onReady).catch(onError);
    return ret.promise();

  };

  function defaultPatient(){
    return {
      fname: {value: ''},
      lname: {value: ''},
      gender: {value: ''},
      birthdate: {value: ''},
      height: {value: ''},
      systolicbp: {value: ''},
      diastolicbp: {value: ''},
      ldl: {value: ''},
      hdl: {value: ''},
    };
  }

  function getBloodPressureValue(BPObservations, typeOfPressure) {
    var formattedBPObservations = [];
    BPObservations.forEach(function(observation){
      var BP = observation.component.find(function(component){
        return component.code.coding.find(function(coding) {
          return coding.code == typeOfPressure;
        });
      });
      if (BP) {
        observation.valueQuantity = BP.valueQuantity;
        formattedBPObservations.push(observation);
      }
    });

    return getQuantityValueAndUnit(formattedBPObservations[0]);
  }

  function getQuantityValueAndUnit(ob) {
    if (typeof ob != 'undefined' &&
        typeof ob.valueQuantity != 'undefined' &&
        typeof ob.valueQuantity.value != 'undefined' &&
        typeof ob.valueQuantity.unit != 'undefined') {
          return ob.valueQuantity.value + ' ' + ob.valueQuantity.unit;
    } else {
      return undefined;
    }
  }

  window.drawVisualization = function(p) {
    $('#holder').show();
    $('#loading').hide();
    $('#fname').html(p.fname);
    $('#lname').html(p.lname);
    $('#gender').html(p.gender);
    $('#birthdate').html(p.birthdate);
    $('#height').html(p.height);
    $('#systolicbp').html(p.systolicbp);
    $('#diastolicbp').html(p.diastolicbp);
    $('#ldl').html(p.ldl);
    $('#hdl').html(p.hdl);
  };

})(window);
