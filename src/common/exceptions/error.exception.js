
export const ApplicationException=({
    message ='something went wrong',
    options = {cause :{status: 500}}
})=>{
throw new Error (message ,options )
}


// 400
export const NotFoundException=({
    message ='Not Found',
    options = {cause :{status: 404}}
})=>{
throw  ApplicationException({message , options});
}

// 401
export const BadRequestException = ({
  message = 'Bad Request',
  options = { cause: { status: 400 , errors:undefined } },
}) => {
throw  ApplicationException({message , options});
};

// 401
export const UnauthorizedException = ({
  message = 'Unauthorized',
  options = { cause: { status: 401 } },
}) => {
throw  ApplicationException({message , options});
};

// 403
export const ForbiddenException = ({
  message = 'Forbidden',
  options = { cause: { status: 403 } },
}) => {
throw  ApplicationException({message , options});
};

// 405
export const MethodNotAllowedException = ({
  message = 'Method Not Allowed',
  options = { cause: { status: 405 } },
}) => {
throw  ApplicationException({message , options});
};

// 409
export const ConflictException = ({
  message = 'Conflict',
  options = { cause: { status: 409 } },
}) => {
throw  ApplicationException({message , options});
};

// 422
export const UnprocessableEntityException = ({
  message = 'Unprocessable Entity',
  options = { cause: { status: 422 } },
}) => {
 throw  ApplicationException({message , options});
};

// 429
export const TooManyRequestsException = ({
  message = 'Too Many Requests',
  options = { cause: { status: 429 } },
}) => {
  throw  ApplicationException({message , options});
};

// 500
export const InternalServerErrorException = ({
  message = 'Internal Server Error',
  options = { cause: { status: 500 } },
}) => {
 throw  ApplicationException({message , options});
};

// 502
export const BadGatewayException = ({
  message = 'Bad Gateway',
  options = { cause: { status: 502 } },
}) => {
 throw  ApplicationException({message , options});
};

// 503
export const ServiceUnavailableException = ({
  message = 'Service Unavailable',
  options = { cause: { status: 503 } },
}) => {
  throw  ApplicationException({message , options});
};

// 504
export const GatewayTimeoutException = ({
  message = 'Gateway Timeout',
  options = { cause: { status: 504 } },
}) => {
  throw  ApplicationException({message , options});
};

