const app = angular.module("myapp", []);
app.controller("mycontro", ($scope, $http) => {
  $scope.queryallpoly = () => {
    $http.get("/getallpolyhouse").then(
      (response) => {
        $scope.cards = response.data;
        console.log($scope.cards);
      },
      (error) => {
        alert("Something Went wrong! Please Try After Some Time");
      }
    );
  };

  $scope.addpolyhs = () => {
    $http({
      url: "createpolyhouse",
      method: "POST",
      data: {
        name: $scope.name,
        desc: $scope.desc,
      },
    }).then(
      (response) => {
        $scope.queryallpoly();
        console.log(response.data);
        //staticBackdrop.hide();
        if (response.data.status === "ok") {
          $scope.message = "PolyHouse Created SuccessFully!";
        } else {
          $scope.message = "Something Went Wrong!";
        }
        myModal.show();
        $scope.queryallpoly();
      },
      (error) => {
        console.log(error);
      }
    );
  };

  $scope.editpolybox = (id, name, desc) => {
    $scope.editname = name;
    $scope.editdesc = desc;
    $scope.editid = id;
  };

  $scope.updatepoly = (id) => {
    console.warn("updating polyhouse", id);
    $http({
      url: `/editpolyhousedetails/${id}`,
      method: "PATCH",
      data: {
        name: $scope.editname,
        desc: $scope.editdesc,
      },
    }).then(
      (response) => {
        console.log(response.data);
        if (response.data.status === "ok") {
          alert("PolyHouse Updated SuccessFully!");
          $scope.queryallpoly();
        } else {
          alert("Something Went Wrong!");
          $scope.queryallpoly();
        }
        editboxmodal.hide();
      },
      (error) => {
        console.log(error);
        editboxmodal.hide();
      }
    );
  };
});
