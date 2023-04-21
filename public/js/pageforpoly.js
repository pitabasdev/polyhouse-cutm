var app = angular.module("myapp", []);
app.controller("myctrl", ($scope, $http, $window) => {
  $scope.updateall = () => {
    const pathArray = window.location.pathname.split("/");
    if (
      $scope.temp === "" ||
      $scope.temp === undefined ||
      $scope.humidity === "" ||
      $scope.humidity === undefined ||
      $scope.moisture === "" ||
      $scope.moisture === undefined
    ) {
      //alert("First Fill Up All The Required fields ! ");
      $scope.message =
        "Please Fill All The Details ! \n And All Values Should be Under 100. ";
      myModal.show();
    } else {
      $http({
        method: "POST",
        url: `/addthreshhold/${pathArray[2]}`,
        data: {
          re_temp: $scope.temp,
          re_humidity: $scope.humidity,
          re_soilmoisture: $scope.moisture,
        },
      }).then(
        (response) => {
          console.log(response.data);
          $scope.message = response.data.message;
          myModal.show();
          $scope.getrefvalues();
        },
        (error) => {
          console.log(error);
        }
      );
    }
  };

  $scope.getallcurvalue = () => {
    const pathArray = window.location.pathname.split("/");
    $http.get(`/getsensordata/${pathArray[2]}`).then(
      (response) => {
        console.log(response.data);
        $scope.responsefromapi = response.data;
      },
      (error) => {
        console.log(error);
      }
    );
  };

  $scope.getrefvalues = () => {
    const pathArray = window.location.pathname.split("/");
    $http.get(`/getrefvalues/${pathArray[2]}`).then(
      (response) => {
        $scope.refvalues = response.data;
      },
      (error) => {
        alert("something Went Wrong ! ");
      }
    );
  };

  $scope.makechangeincurrentvalues = () => {
    const pathArray = window.location.pathname.split("/");
    $http.get(`/getthreshholdvalue/${pathArray[2]}`).then(
      (response) => {
        console.log(response.data.led[0]);
        $scope.currentstatusofperiph = response.data.led[0];
      },
      (error) => {
        alert("Something Went Wrong!");
      }
    );
  };
});
