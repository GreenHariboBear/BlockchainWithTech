package main

import (
    "errors"
    "fmt"
    "encoding/json"
    "github.com/hyperledger/fabric/core/chaincode/shim"
)

type CrowdFundChaincode struct {
}

type UserLog struct{
    Email string `json:"email"`;
    Data []user `json:"data"`;
}

type user struct{
    Timestamp string
    Role string
    Action string
    WorldID string
}

func (t *CrowdFundChaincode) Init(stub shim.ChaincodeStubInterface,function string, args []string) ([]byte, error) {

    fmt.Printf("Hello ")
    var err error

    if len(args) != 2 {
        return nil, errors.New("Incorrect number of arguments. Expecting 2")
    }

    if err != nil {
        return nil, err
    }

    record := UserLog{}
    record.Email = "NotApplicable"
    record.Data = []user{};
    newrecordByte, err := json.Marshal(record);
    if err != nil {
        return nil, err
    }

    err = stub.PutState("default",newrecordByte);
    if err != nil {
        return nil, err
    }

    return nil, nil

}

func (t *CrowdFundChaincode) Invoke(stub shim.ChaincodeStubInterface, function string, args []string) ([]byte, error) {
    var account string
    var err error

    if len(args) != 5 {
        return nil, errors.New("Incorrect number of arguments. Expecting 4  .")
    }

    account = args[0]

    recordByte, err := stub.GetState(account);
    fmt.Println(recordByte);
    if err != nil {
        return nil, err
    }

    record := UserLog{}
    record.Email = args[0]

    var temp user
    temp.Timestamp = args[1]
    temp.Role = args[2]
    temp.Action =  args[3]
    temp.WorldID = args[4]

    var artist UserLog
    if recordByte != nil {
        err_ret := json.Unmarshal(recordByte,&artist);
        if(err_ret == nil) {
            record.Data = artist.Data;
        }
    }

    record.Data = append(record.Data, temp)

    newrecordByte, err := json.Marshal(record);
    if err != nil {
        return nil, err
    }

    err = stub.PutState(account,newrecordByte);
    if err != nil {
        return nil, err
    }

    return nil, nil

}

func (t *CrowdFundChaincode) Query(stub shim.ChaincodeStubInterface, function string, args []string) ([]byte, error) {

    if function != "read" {
        return nil, errors.New("Invalid query function name. Expecting \"query\".")
    }

    var err error

    if len(args) != 1 {
        return nil, errors.New("Incorrect number of arguments. Expecting name of the state variable to query.")
    }

    var   account = args[0]
    accountValueBytes ,err := stub.GetState(account)
    if err != nil {
        return nil, err
    }

    return accountValueBytes, nil

}

func main() {

    err := shim.Start(new(CrowdFundChaincode))
    if err != nil {
        fmt.Printf("Error starting CrowdFundChaincode: %s", err)
    }
}
