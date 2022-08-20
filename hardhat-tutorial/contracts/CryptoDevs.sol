// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./IWhitelist.sol";

contract CryptoDev is ERC721Enumerable, Ownable {
  string _baseTokenURI;
  uint public _price = 0.01 ether;
  bool public _paused;
  uint public maxTokenIds = 20;
  uint public tokensIds;
  IWhitelist whitelist;
  bool public presaleStarted;
  uint public presaleEnd;

  modifier onlyWhenNotPaused {
    require(!_paused, "Contract currently paused");
    _;
  }

  constructor (string memory baseURI, address whitelistContract) ERC721("Crypto Devs","CD") {
    _baseTokenURI = baseURI;
    whitelist = IWhitelist(whitelistContract);
  }

  function startPresale() public onlyOwner {
    presaleStarted = true;
    presaleEnd = block.timestamp + 5 minutes;
  }

  function mintPresale() public payable onlyWhenNotPaused {
    require(presaleStarted && block.timestamp < presaleEnd, "Presale is not running");
    require(whitelist.whitelistedAddresses(msg.sender), "You are not whitelisted");
    require(tokensIds < maxTokenIds, "Exceeded maximum Crypto Devs supply");
    require(msg.value >= _price, "Ether sent is not correct");

    tokensIds += 1;
    _safeMint(msg.sender,tokensIds);
  }

  function mint() public payable onlyWhenNotPaused {
    require(presaleStarted && block.timestamp >= presaleEnd, "Presale has not ended yet");
    require(tokensIds < maxTokenIds, "Exceeded maximum Crypto Devs supply");
    require(msg.value >= _price, "Ether sent is not correct");

    tokensIds += 1;
    _safeMint(msg.sender,tokensIds);
  }

  function _baseURI() internal view virtual override returns (string memory) {
    return _baseTokenURI;
  }

  function setPaused(bool val) public onlyOwner {
    _paused = val;
  } 

  function withdraw() public onlyOwner {
    address _owner = owner();
    uint amount = address(this).balance;
    (bool succes,) = _owner.call{value: amount}("");
    require(succes, "Failed to send Ether");
  }

  receive() external payable {}

  fallback() external payable {}

}