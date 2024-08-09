export default class MockHttpRequestFactory {
    constructor(mockService){
        this.mockService = mockService;
    }
    send(request){
        try {
            return Promise.resolve(this.mockService.handle(request));
        }
        catch (error) {
            return Promise.reject(error);
        }
    }
}