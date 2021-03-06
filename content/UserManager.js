angular.module(SERIFYAPP).service('userManager', [ 'apiService', 'loginStatusProvider', function(apiService, loginStatusProvider) {
	this.UserId = null;
	this.GetUserIdPromise = function() {
		if(this.UserId) { return Promise.resolve(this.UserId); }
		return new Promise(function(s, f) {
			AWS.config.credentials.get(function(error) { error ? f(error) : s(AWS.config.credentials.identityId); });
		})
		/* jshint -W093 */
		.then(function(id) { return this.UserId = id; });
		/* jshint +W093 */
	};

	this.CaptureUserIdentity = function(data) {
		return apiService.getPromise('PUT', '/user', data)
		.then(function(result) {
			console.log(JSON.stringify({Title: 'User Update Result', Result: result.toString(), Detail: result}, null, 2));
			return result;
		})
		.catch(function(failure) {
			console.error(JSON.stringify({Title: 'Failed to update user.', Error: failure.stack || failure.toString(), Detail: failure}, null, 2));
			return Promise.reject({
				Error: 'Unable to update current user, please resumbit.',
				Detail: failure
			});
		});
	};
	this.GetUserDataPromise = function(userId) {
		return apiService.getPromise('GET', '/user', {
			user: userId
		})
		.catch(function(failure) {
			console.error(JSON.stringify({Title: 'Failed to get user', UserId: userId, Error: failure.stack || failure.toString(), Detail: failure}, null, 2));
			return Promise.reject({
				Error: 'Unable to get user profile, please try again later.',
				Detail: failure
			});
		});
	};
	this.VerificationRequest = function(verifications, user) {
		return apiService.getPromise('POST', '/user/verifications', {
			verifications: verifications,
			user: user
		})
		.then(function(result) {
			return result;
		})
		.catch(function(failure) {
			console.error(JSON.stringify({Title: 'Failed to set verification results.', Error: failure.stack || failure.toString(), Detail: failure}, null, 2));
			return Promise.reject({
				Error: 'Unable to update current user, please resumbit.',
				Detail: failure
			});
		});
	};
	this.UpdateUserDataPromise = function(data) {
		return apiService.getPromise('PUT', '/user/data', data)
		.then(function(result) {
			console.log(JSON.stringify({Title: 'User Update Result', Result: result.toString(), Detail: result}, null, 2));
			return result;
		})
		.catch(function(failure) {
			console.error(JSON.stringify({Title: 'Failed to update user.', Error: failure.stack || failure.toString(), Detail: failure}, null, 2));
			return Promise.reject({
				Error: 'Unable to update current user, please resumbit.',
				Detail: failure
			});
		});
	};
	this.GetUserAllInformation = function(emailAddress) {
		return apiService.getPromise('GET', '/admin/user', { emailAddress: emailAddress})
		.then(function(result) {
			return result;
		})
		.catch(function(failure) {
			console.error(JSON.stringify({Title: 'Failed to get user.', Error: failure.stack || failure.toString(), Detail: failure}, null, 2));
			return Promise.reject({
				Error: 'Unable to get user.',
				Detail: failure
			});
		});
	};
}]);