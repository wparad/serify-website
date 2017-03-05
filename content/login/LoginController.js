angular.module(GOLFPRO).config(['$routeProvider', function($routeProvider) {
	$routeProvider.when('/', { templateUrl: 'login/login.html', controller: 'loginController' });
	$routeProvider.when('/main', {redirectTo:'/'});
	$routeProvider.when('/home', {redirectTo:'/'});
}]);
angular.module(GOLFPRO).controller('loginController', [
	'$scope',
	'$routeParams',
	'$uibModal',
	'loginStatusProvider',
	'eventHandler',
	'pageService',
	'userManager',
	'ngDialog',
	'utilities',
	'linkManager',
	'logoutService',
function($scope, $routeParams, $uibModal, loginStatusProvider, eventHandler, pageService, userManager, ngDialog, utilities, linkManager, logoutService) {
	$scope.closeAlert = function(){ $scope.alert = null; };
	/******** SignInButton Block ********/
	$scope.IsAdmin = false;
	$scope.UserAuthenticated = false;
	$scope.links = [];
	function SetupUser() {
		return loginStatusProvider.validateAuthenticationPromise()
		.then(function(authData) {
			try {
				var data = JSON.parse(atob(authData.UserId.split('.')[1]));
				userManager.CaptureUserIdentity({
					cognitoSub: data.sub,
					email: data['cognito:username']
				});
				$scope.email = data['cognito:username'];
			}
			catch (exception) {}
			$scope.UserAuthenticated = true;
			return userManager.GetUserIdPromise().then(function(id){
				$scope.$apply(function(){
					$scope.UserId = id;
				});
			});
		})
		.then(function(){
			var usernamemetadataPromise = userManager.GetUserDataPromise()
			.then(function(user){
				$scope.$apply(function(){
					$scope.IsAdmin = user.admin;
					$scope.userProfile = (user.userData || {}).profile;
					$scope.username = (user.userData || {}).username;
					var verifications = (user || {}).Verifications || [];
					verifications.map(function(verification) {
						verification.Inverse = verification.Name !== 'HPV' && verification.Name !== 'PrEP';
						verification.Name = TESTS.find(function(t){ return t.id === verification.Name; }).name;
					});
					$scope.verifications = verifications;
				});
			});
			var usernameLinkCreationPromise = linkManager.GetNewLinkPromise(null, null)
			.then(function(link){
				$scope.$apply(function(){
					$scope.userLink = {
						url: WEBSITE_VIEW_URL + link,
						link: link
					};
				});
			});
			return Promise.all([usernamemetadataPromise, usernameLinkCreationPromise]);
		}).catch(function(f){ console.log(f); });
	}

	$scope.ShowFeedBackFormClick = function () {
		var modalInstance = $uibModal.open({
			templateUrl: 'login/feedbackForm.html',
			controller: ['$scope', '$uibModalInstance', 'loginStatusProvider', 'feedbackManager', function($scope, $uibModalInstance, loginStatusProvider, feedbackManager) {
				$scope.form = $scope.$resolve.form;
				$scope.closeAlert = function(){ $scope.alert = null; };
				$scope.alert = null;
				$scope.SubmitFeedbackForm = function () {
					loginStatusProvider.validateUnauthenticationPromise()
					.then(function() {
						feedbackManager.CreateFeedback($scope.form)
						.then(function() {
							$scope.$apply(function() {
								$scope.alert = { type: 'success', msg: 'Feedback Submitted!'};
							});
							setTimeout(function() {
								$scope.$apply(function() { $uibModalInstance.close('closed'); });
							}, 1000);
						}, function() {
							$scope.alert = { type: 'danger', msg: 'Failed to send feedback, please try again.'};
						});
					});
				};

				$scope.DismissFeedbackForm = function () {
					$uibModalInstance.dismiss('cancel');
				};
			}],
			resolve: {
				form: function() {
					return {
						userAuthenticated: $scope.UserAuthenticated,
						username: $scope.username,
						email: $scope.email
					};
				}
			}
		});

		modalInstance.result.then(function (selectedItem) {
			$scope.selected = selectedItem;
		}, function () {
			console.log('Modal dismissed at: ' + new Date());
		});
	};
	$scope.SignInButtonClick = function() {
		if($scope.UserAuthenticated) {
			logoutService.Logout()
			.catch(function(failure) {
				console.log(failure);
				$scope.$apply(function(){
					$scope.alert = { type: 'danger', msg: 'Failed to log out.' };
				});
			});
			return;
		}
		ngDialog.open({
			closeByNavigation: true,
			width: 320,
			template: 'login/signup.html',
			controller: 'signinController',
			className: 'ngdialog-theme-default'
		}).closePromise.then(function(){
			return SetupUser();
		});
	};
	SetupUser();

	/******** SignInButton Block ********/
	$scope.verifications = [];
	$scope.AddVerificationsButtonClick = function(){
		pageService.NavigateToPage('update');
	};
	$scope.AdminButtonClick = function() {
		pageService.NavigateToPage('admin');
	};
	$scope.PublicProfileButtonClick = function() {
		pageService.NavigateToPage('view/'+$scope.userLink.link);
	};
	$scope.SaveProfileButtonClick = function() {
		userManager.UpdateUserDataPromise({
			profile: $scope.userProfile,
			username: $scope.username
		}).then(function(){
			$scope.$apply(function(){
				$scope.alert = { type: 'success', msg: 'Profile updated' };
			});
		}).catch(function(failure) {
			console.error("Failed to save user profile: " + failure);
			$scope.$apply(function(){
				$scope.alert = { type: 'danger', msg: 'Failed to save profile. Please try again.' };
			});
		});
	};
	$scope.PrivacyButtonClick = function() {
		pageService.NavigateToPage('policy');
	};
}]);
