function handlingError(app) {
  app.use((req, res) => {
    res.status(404).json({ errorMessage: 'This route does not exist' });
  });
  app.use((error, req, res, next) => {
    console.error('ERROR', req.method, req.path, error);
    res.status(500).json({
      errorMessage:
        'Internal server error. Check the server console for details',
    });
  });
}
module.exports = handlingError;
