pragma solidity 0.4.24;


contract ERC721X {
  function implementsERC721X() external pure returns (bool);
  function individualSupply(uint256 tokenId) external view returns (uint256);
  function ownerOf(uint256 _tokenId) external view returns (address _owner);
  function balanceOf(address owner, uint256 tokenId) external view returns (uint256);
  function tokensOwned(address owner) external view returns (uint256[]);

  function transfer(address to, uint256 tokenId, uint256 quantity) external;
  function transferFrom(address from, address to, uint256 tokenId, uint256 quantity) external;

  // Fungible Safe Transfer From
  function safeTransferFrom(address from, address to, uint256 tokenId, uint256 _amount) external;
  function safeTransferFrom(address from, address to, uint256 tokenId, uint256 _amount, bytes data) public;

  // Batch Safe Transfer From
  function safeBatchTransferFrom(address _from, address _to, uint256[] tokenIds, uint256[] _amounts, bytes _data) public;

  function name() external view returns (string);
  function symbol() external view returns (string);
  function tokenName(uint256 tokenId) external view returns (string);

  // Required Events
  event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
  event TransferToken(address indexed from, address indexed to, uint256 indexed tokenId, uint256 quantity);
  event ApprovalForAll(address indexed _owner, address indexed _operator, bool _approved);
  event BatchTransfer(address from, address to, uint256[] tokenTypes, uint256[] amounts);
}
