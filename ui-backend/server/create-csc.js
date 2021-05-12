var server = require("./server");
var ds = server.dataSources.db;
var app = require("./server");
var csc = require("country-state-city").default;

async function createLocations() {
  // var allCountries = csc.getAllCountries();
  var allCountries = [csc.getCountryById("101")];
  allCountries = allCountries.map(country => {
    return { code: country.sortname, name: country.name, importId: country.id };
  });
  await app.models.Country.create(allCountries);

  var allStates = [];
  allCountries = await app.models.Country.find({});

  allCountries.forEach(country => {
    allStates = allStates.concat(csc.getStatesOfCountry(country.importId));
  });

  var allImportedSates = await Promise.all(
    allStates.map(state => {
      const asyncStateFunc = async state => {
        var country = await app.models.Country.findOne({
          where: {
            importId: state.country_id
          }
        });
        var stateObj = {
          code: state.name,
          name: state.name,
          countryId: country.id,
          importId: state.id
        };
        return Promise.resolve(stateObj);
      };
      return asyncStateFunc(state);
    })
  );

  await app.models.State.create(allImportedSates);

  var allCities = [];
  allImportedSates.forEach(state => {
    allCities = allCities.concat(csc.getCitiesOfState(state.importId));
  });

  var allImportedCities = await Promise.all(
    allCities.map(async city => {
      var state = await app.models.State.findOne({
        where: {
          importId: city.state_id
        }
      });
      var cityObj = {
        code: city.name,
        name: city.name,
        stateId: state.id,
        importId: city.id
      };
      return Promise.resolve(cityObj);
    })
  );
  await app.models.City.create(allImportedCities);

  ds.disconnect();
}
createLocations();
