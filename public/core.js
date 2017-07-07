


var login = angular.module('login', []);

function mainController($scope, $http) {
    
    var provider = new firebase.auth.GoogleAuthProvider();
    
    // Get a reference to the database service
    var database = firebase.database();

    $scope.formData = {};
    $scope.userId;  
    $scope.displayName;
    $scope.email;
    $scope.photoURL;
    $scope.token;
    $scope.loginDisplay;

     
    if($scope.token == undefined){
         $scope.loginDisplay = "Ingresar";
    }
    $scope.login = function(){
        if($scope.token != undefined){
            logout();
        }else{
            login();
        }
    }

    $scope.usersLogin = [];
    // listening database events for users login
   var usersLoginRef = firebase.database().ref('usersLogin/');
    usersLoginRef.on('child_added', function(data) {
    
    $scope.usersLogin.push({"key":data.key,"username":data.val().username,"photoURL":data.val().photoURL });
    $scope.$apply();
   
    });
    
    usersLoginRef.on('child_removed', function(data) {
        $scope.usersLogin = $scope.usersLogin.filter(user => user.key != data.key);
        $scope.$apply(); 
    });

   function login(){
       firebase.auth().signInWithPopup(provider).then(function(result) {
            // This gives you a Google Access Token. You can use it to access the Google API.
            $scope.token = result.credential.accessToken;
            // The signed-in user info.
            var user = result.user;
            if (user != null) {
                $scope.userId= user.uid;
                $scope.displayName = user.displayName;
                $scope.email = user.email;
                $scope.photoUrl = user.photoURL;                
                $("#imgPerfil").attr('src',$scope.photoUrl);
                $("#imgPerfil").css('display','inline');
                $scope.loginDisplay = "Hola, ";
                
                $scope.$apply();       
            }            
            // ...
            }).catch(function(error) {
            // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;
            console.log(error);
            // The email of the user's account used.
            var email = error.email;
            // The firebase.auth.AuthCredential type that was used.
            var credential = error.credential;
            // ...
        }).then(function(data){
            console.log(data);
            writeUserData($scope.userId, $scope.email, $scope.displayName, $scope.photoUrl);
            writeUserLogin($scope.userId,$scope.displayName, $scope.photoUrl);
        });
        
   }
   function logout(){
         if($scope.token != undefined){
         firebase.auth().signOut().then(function() {
            // Sign-out successful.
            $scope.token = undefined;
            console.log("logout");
            $("#imgPerfil").attr('src','');
            $("#imgPerfil").css('display','none');
            $scope.loginDisplay = "Ingresar";
            $scope.displayName = "";
            $scope.email = "";
            $scope.photoUrl = "";
            $scope.$apply();
            }, function(error) {
            // An error happened.
        }).then(function(){
             writeUserLogout($scope.userId);
             $scope.userId = undefined;
        });
        }
    };
    function writeUserData(userId,email, name, imageUrl) {
        firebase.database().ref('users/' + userId).set({
            username: name,
            email :email,
            photoURL : imageUrl
        });
    };
    function writeUserLogin(userId,name,imageUrl) {
        firebase.database().ref('usersLogin/' + userId).set({
            username: name,
            photoURL : imageUrl
        });
    };
    function writeUserLogout(userId) {
       var userRef = firebase.database().ref('usersLogin/' + userId).remove().then(function() {
            console.log("Remove succeeded.")
        })
        .catch(function(error) {
            console.log("Remove failed: " + error.message)
        });
    };

    
}
