resolve: {
    fallback: {
      "https": require.resolve('https-browserify'),
      "assert": require.resolve('assert/'),
      "util": require.resolve('util/')
    }
  }
  